import {Issue} from "../../issue";
import {Total} from "./total";
import {IFormatter} from "./_iformatter";

class Tuple {
  public filename: string;
  public description: string;

  public constructor(filename: string, description: string) {
    this.filename = filename;
    this.description = description;
  }
}

export class Standard implements IFormatter {

  public output(issues: Issue[], fileCount: number): string {
    const tuples: Tuple[] = [];
    for (const issue of issues) {
      tuples.push(this.build_tuple(issue));
    }

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

  private build_tuple(issue: Issue): Tuple {
    return new Tuple(issue.getFilename() +
                     "[" + issue.getStart().getRow() + ", " + issue.getStart().getCol() + "]",
                     issue.getMessage() + " (" + issue.getKey() + ")");
  }

}