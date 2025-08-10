/** @typedef {import('jest').Config} JestConfig */
/** @typedef {import("webpack").Configuration} WebpackConfig */
/** @typedef {import("ts-jest").ConfigSet} TSJestConfig */

import * as glob from 'glob';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';

/**
 * @param {string[]} files 
 * @param {string} forDir 
 * @returns {string[]}
 */
function orderSync(files, forDir) {
  if (!fs.existsSync(".temp")) {
    fs.mkdirSync(".temp");
  }

  const tempdir = ".temp";
  const tempfile = path.join(tempdir, `node-for-${forDir}.${files[0].split(/\w\./)[1]}`);

  function sortArr(a, b) {
    const aIsCore = a.includes("core") ? -1 : 1;
    const bIsCore = b.includes("core") ? -1 : 1;
    return aIsCore - bIsCore;
  }

  const contents = [];
  files = files.sort(sortArr);
  console.log("Files:", files);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    contents.push(content + "\n");
  }

  contents.forEach((v) => fs.appendFileSync(tempfile, v));

  return [path.join("..", tempfile)];
}

/**
 * Config for each jest enviroment
 * @param {string} dir 
 * @param {string[]} setup 
 * @returns {JestConfig}
 */
const jest = (dir, setup) => {
  const dirLower = dir.toLowerCase();
  const root = path.resolve(__dirname, "..", "tests", dirLower === "all" ? "" : dirLower);

  if (fs.readdirSync(root).length <= 0) return false;

  return {
    rootDir: root,
    testEnvironment: "jsdom",
    setupFiles: orderSync(setup, dir),
    preset: 'ts-jest',
    moduleFileExtensions: ['ts', 'js'],
    testRegex: '\\.test\\.(ts|js)$',
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        tsconfig: "./tsconfig.json"
      }],
    }
  };
};

const jestglobal = (projects) => {
  return {
    rootDir: "../",
    projects: projects
  };
};

/**
 * Config for each webpack collection
 * @param {string} key 
 * @param {string[]} value 
 * @returns {WebpackConfig}
 */
const webpack = (key, value) => {
  return {
    mode: "production",
    name: key,
    entry: [path.resolve(__dirname, "bootstrap.ts"), ...orderSync(value, key)],
    output: {
      filename: `${key}.js`,
      path: path.resolve(__dirname, "..", "dist"),
    },
    optimization: {
      minimize: false,
      concatenateModules: true
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          compilerOptions: {
            typeRoots: [
              path.resolve(__dirname, 'types'),
              path.resolve(__dirname, `types/${key.charAt(0).toUpperCase() + key.slice(1)}`)
            ]
          }
        }
      }]
    }
  };
};

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { glob, path, fs, url };
export default {
  jest, jestglobal, webpack, 
  __dirname
};