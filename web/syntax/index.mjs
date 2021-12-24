import {copyFileSync, mkdirSync, rmSync} from "fs";
import {join, dirname} from "path";
import {Graph} from "./graphs.mjs";
import {fileURLToPath} from "url";
import {generate} from "./generate.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const build = join(__dirname, "build");
rmSync(build, {recursive: true, force: true});
mkdirSync(build);
mkdirSync(join(build, "abap"));
mkdirSync(join(build, "ddl"));
mkdirSync(join(build, "cds"));

generate(Graph.buildABAPData());

copyFileSync(join(__dirname, "public", "index.html"), join(build, "index.html"));
copyFileSync(join(__dirname, "public", "script.js"), join(build, "script.js"));
copyFileSync(join(__dirname, "public", "style.css"), join(build, "style.css"));