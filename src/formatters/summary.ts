import File from "../file";

export class Summary {

  public static output(files: Array<File>): string {
    let result = "";

    for (let file of files) {
      if (file.getIssues().length > 0) {
        result = result +
          file.getFilename() +
          "\t" +
          file.getIssues().length +
          " issue(s)\n";
      }
    }
    return result;
  }

}