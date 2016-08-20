import File from "../file";

export class Json {

  public static output(files: Array<File>): string {
    let out = [];

    for (let file of files) {
      for (let issue of file.getIssues()) {
        let single = {
          description: issue.getDescription(),
          file: file.getFilename(),
          start: {
            row: issue.getStart().getRow(),
            col: issue.getStart().getCol(),
          },
          end: {
            row: issue.getEnd().getRow(),
            col: issue.getEnd().getCol(),
          },
        };
        out.push(single);
      }
    }
    return JSON.stringify(out) + "\n";
  }

}