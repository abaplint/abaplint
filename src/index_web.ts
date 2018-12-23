import {Config} from "./config";
import {MemoryFile} from "./files";
import {Version, textToVersion} from "./version";
import {Formatter} from "./formatters/_format";
import {Registry} from "./registry";
import {Issue} from "./issue";
import * as Nodes from "./abap/nodes";

// todo figure out how these exports relate to the exports in index.ts
// this part is required for the web things to work
exports.File = MemoryFile;
exports.Nodes = Nodes;
exports.Nodes = Issue;
exports.Registry = Registry;
exports.Config = Config;
exports.Version = Version;
exports.textToVersion = textToVersion;
exports.Formatter = Formatter;