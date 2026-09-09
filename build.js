const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "frontend", "dist");
const destination = path.join(__dirname, "dist");

if (fs.existsSync(destination)) {
  fs.rmSync(destination, {
    recursive: true,
    force: true
  });
}

fs.cpSync(source, destination, {
  recursive: true
});

console.log("Frontend build copied to root dist/");