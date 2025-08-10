import config, { path, glob } from './config.js';

/**
 * @param {string[]} files 
 * @returns {string[]}
 */
function readOptiFileSync(files) {
  const filesmap = files.map(f => path.resolve(config.__dirname, "..", "dist", f));
  return filesmap;
}

function readOptiDirSync(pattern) {
  const files = glob.sync(pattern).sort((a, b) => {
    const aIsCore = a.includes("core");
    const bIsCore = b.includes("core");
    if (aIsCore && !bIsCore) return -1;
    if (!aIsCore && bIsCore) return 1;
    return 0; // keep original order otherwise
  });
  return files;
}

const configdirs = Object.entries({
  "All": readOptiDirSync("dist/*.js"),
  "Core": readOptiFileSync(["core.js"]),
  "Crafty": readOptiFileSync(["core.js", "crafty.js"]),
  "Evented": readOptiFileSync(["core.js", "evented.js"]),
  "Flow": readOptiFileSync(["core.js", "flow.js"]),
  "Query": readOptiFileSync(["core.js", "query.js"]),
  "Requests": readOptiFileSync(["core.js", "requests.js"]),
  "Templated": readOptiFileSync(["core.js", "templated.js"])
}).map(([dir, setup]) => {
  return config.jest(dir, setup);
}).filter(Boolean);

/** @type {import('jest').Config} */
export default {
  rootDir: "../tests",
  passWithNoTests: true,
  projects: configdirs
};