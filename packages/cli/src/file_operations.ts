import {CompressedFile} from "./compressed_file";
import {IProgress, IFile, MemoryFile} from "@abaplint/core";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as glob from "glob";
import * as os from "node:os";
import * as path from "node:path";
import * as pLimit from "p-limit";
import * as zlib from "node:zlib";

export class FileOperations {

  public static deleteFolderRecursive(dir: string) {
    if (fs.existsSync(dir) === false) {
      return;
    }

    fs.rmSync(dir, {recursive: true});
  }

  public static loadFileNames(arg: string, error = true): string[] {
    const files = glob.sync(arg, {nodir: true, absolute: true, posix: true});
    if (files.length === 0 && error) {
      throw "Error: No files found, " + arg;
    }
    return files;
  }

  private static async readFile(filename: string, compress: boolean | undefined): Promise<IFile> {
    const raw = await fsPromises.readFile(filename, {encoding: "utf8"});
    if (compress === true) {
// todo, util.promisify(zlib.deflate) does not seem to work?
      return new CompressedFile(filename, zlib.deflateSync(raw).toString("base64"));
    } else {
      return new MemoryFile(filename, raw);
    }
  }

  private static setupPLimit() {
    let concurrency = os.cpus().length;
    if (concurrency > 8) {
      concurrency = 8;
    } else if (concurrency < 1) {
      concurrency = 1;
    }
    return pLimit(concurrency);
  }

  public static async loadFiles(compress: boolean | undefined, input: string[], bar: IProgress): Promise<IFile[]> {
    const limit = this.setupPLimit();

    input = input.filter((filename) => {
      const base = filename.split("/").reverse()[0];
      if (base.split(".").length <= 2) {
        return false;
      }
      return true;
    });
    bar.set(input.length, "Reading files");

    const promises = input.map((filename) => {
      return limit(async () => {
        bar.tick("Reading files - " + path.basename(filename));
        return this.readFile(filename, compress);
      });
    });
    const files = await Promise.all(promises);

    return files;
  }

}