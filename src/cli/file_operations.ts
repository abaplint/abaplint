import * as fs from "fs";
import * as path from "path";
import {CompressedFile, MemoryFile} from "../files";
import * as zlib from "zlib";
import * as glob from "glob";
import {IProgress} from "../registry";
import {IFile} from "../files/_ifile";

export class FileOperations {

  public static deleteFolderRecursive(p: string) {
    if (fs.existsSync(p) ) {
      const files = fs.readdirSync(p);
      for (const file of files) {
        const curPath = p + path.sep + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      }
      fs.rmdirSync(p);
    }
  }

  public static loadFileNames(arg: string, error = true): string[] {
    let files: string[] = [];
    files = files.concat(glob.sync(arg, {nosort: true, nodir: true}));
    if (files.length === 0 && error) {
      throw "Error: No files found";
    }
    return files;
  }

  public static async loadFiles(compress: boolean, input: string[], bar: IProgress): Promise<IFile[]> {
    const files: IFile[] = [];

    bar.set(input.length, ":percent - :elapseds - Reading files - :filename");

    for (const filename of input) {
      bar.tick({filename: path.basename(filename)});

      const base = filename.split("/").reverse()[0];
      if (base.split(".").length <= 2) {
        continue; // not a abapGit file
      }

// note that readFileSync is typically faster than async readFile,
// https://medium.com/@adamhooper/node-synchronous-code-runs-faster-than-asynchronous-code-b0553d5cf54e
      const raw = fs.readFileSync(filename, "utf8").replace(/\r/g, ""); // ignore all carriage returns
    // tslint:disable-next-line:no-constant-condition
      if (compress) {
// todo, util.promisify(zlib.deflate) does not seem to work?
        files.push(new CompressedFile(filename, zlib.deflateSync(raw).toString("base64")));
      } else {
        files.push(new MemoryFile(filename, raw));
      }
    }
    return files;
  }

}