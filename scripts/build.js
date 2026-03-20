const fs = require("fs");
const path = require("path");

const root = process.cwd();
const buildDir = path.join(root, "build");

const itemsToCopy = [
  "index.html",
  "styles.css",
  "script.js",
  "frames",
  "capital-one-logo-png_seeklogo-425557.png"
];

function ensureExists(relPath) {
  const absPath = path.join(root, relPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Missing required path: ${relPath}`);
  }
  return absPath;
}

function runBuild() {
  fs.rmSync(buildDir, { recursive: true, force: true });
  fs.mkdirSync(buildDir, { recursive: true });

  for (const item of itemsToCopy) {
    const source = ensureExists(item);
    const destination = path.join(buildDir, item);
    fs.cpSync(source, destination, { recursive: true });
  }

  console.log("Build complete: build/");
}

runBuild();
