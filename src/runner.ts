import Config from "./config";
import {MemoryFile} from "./files";
import {Version, textToVersion} from "./version";
import {Formatter} from "./formatters/";
import {Registry} from "./registry";

export default class Runner {
  public static version(): string {
    // magic, see build script "version.sh"
    return "{{ VERSION }}";
  }
}

// this part is required for the web things to work
exports.File = MemoryFile;
exports.Runner = Runner;
exports.Registry = Registry;
exports.Config = Config;
exports.Version = Version;
exports.textToVersion = textToVersion;
exports.Formatter = Formatter;