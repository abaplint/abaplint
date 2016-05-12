import Issue from "../issue";
import File from "../file";

export class Json {

  public static output(files: Array<File>): string {
    let out = [];

    let issues: Array<Issue> = [];
    files.forEach((file) => { issues = issues.concat(file.get_issues()); });

    for (let issue of issues) {
      let single = { type: "issue",
        check_name: issue.getDescription(),
        description: issue.getDescription(),
        categories: ["Complexity"],
        location: {
          path: issue.getFilename(),
            lines: {
              begin: issue.getStart().getRow(),
              end: issue.getStart().getRow(),
            },
          },
        };
      out.push(single);
    }
    return JSON.stringify(out, undefined, "  ");
  }

}