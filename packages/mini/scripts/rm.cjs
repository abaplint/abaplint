const fs = require("fs");

fs.rmSync(process.argv[2], {recursive: true, force: true});
