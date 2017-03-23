import {File, ParsedFile} from "./file";

export class Downport {

  public static run(files: Array<ParsedFile>): Array<File> {
// todo, for now just pass output = input
    let ret = [];

    for (let f of files) {
      ret.push(new File(f.getFilename(), f.getRaw()));
    }

    return ret;
  }

}