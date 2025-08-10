import config, { glob } from './config.js';

/** @typedef {import("webpack").Configuration} Config */

/**
 * @param {string} dir 
 * @returns {string[]}
 */
function readOptiDirSync(dir) {
  const files = glob.sync(dir)
    .filter(f => f.endsWith(".ts"))
    .sort((a, b) => {
      if (a.includes("assignments")) return 1;
      if (b.includes("assignments")) return -1;
      return 0;
    })
    .map(v => "./" + v);

  return files; // assignments go last
}

const coreFiles = readOptiDirSync("src/*.ts");

const entries = Object.entries({
  "core": coreFiles,
  "crafty": readOptiDirSync("src/Crafty/*.ts"),
  "query": readOptiDirSync("src/Query/*.ts"),
  "evented": readOptiDirSync("src/Evented/*.ts"),
  "requests": readOptiDirSync("src/Requests/*.ts"),
  "templated": readOptiDirSync("src/Templated/*.ts"),
  "flow": readOptiDirSync("src/Flow/*.ts"),
}).filter(([_, v]) => v.length > 0).map(([key, value]) => {
  /** @type {Config} */
  return config.webpack(key, value);
});

export default entries;