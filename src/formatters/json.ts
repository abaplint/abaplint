import {Issue} from "../issue";

export class Json {

// todo, change all formatters to non static, so they can implement an interface?
  public static output(issues: Array<Issue>): string {
    let out = [];

    for (let issue of issues) {
      let single = {
        description: issue.getDescription(),
        file: issue.getFile().getFilename(),
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
    return JSON.stringify(out) + "\n";
  }

}