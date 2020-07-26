import {Issue} from "@abaplint/core";
import {Total} from "./total";
import {IFormatter} from "./_iformatter";

type Tuple = {filename: string, description: string};

export class Standard implements IFormatter {

  public output(issues: Issue[], fileCount: number): string {
    const tuples: Tuple[] = [];
    for (const issue of issues) {
      tuples.push(this.build(issue));
    }

    tuples.sort((a, b) => (a.filename.localeCompare(b.filename)));

    const result = this.columns(tuples);

    return result + new Total().output(issues, fileCount);
  }

  private columns(tuples: Tuple[]): string {
    let max = 0;
    tuples.forEach((tuple) => { if (max < tuple.filename.length) { max = tuple.filename.length; } });

    let result = "";
    tuples.forEach((tuple) => {
      result = result +
        this.pad(tuple.filename, max - tuple.filename.length) +
        tuple.description + "\n";
    });

    return result;
  }

  private pad(input: string, length: number): string {
    let output = input;
    for (let i = 0; i < length; i++) {
      output = output + " ";
    }
    return output + " - ";
  }

  private build(issue: Issue): Tuple {
    return {
      filename: issue.getFilename() + "[" + issue.getStart().getRow() + ", " + issue.getStart().getCol() + "]",
      description: issue.getMessage() + " (" + issue.getKey() + ")"};
  }

}