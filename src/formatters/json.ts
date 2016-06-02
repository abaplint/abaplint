import File from "../file";

export class Json {

  public static output(files: Array<File>): string {
    let out = [];

    for (let file of files) {
      for (let issue of file.getIssues()) {
        let single = { type: "issue",
          check_name: issue.getDescription(),
          description: issue.getDescription(),
          categories: ["Complexity"],
          location: {
            path: file.getFilename(),
              lines: {
                begin: issue.getStart().getRow(),
                end: issue.getStart().getRow(),
              },
            },
          };
        out.push(single);
      }
    }
    return JSON.stringify(out, undefined, "  ");
  }

}