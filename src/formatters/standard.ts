import {Issue} from "../issue";
import {Total} from "./total";

class Tuple {
  public filename: string;
  public description: string;

  constructor(filename: string, description: string) {
    this.filename = filename;
    this.description = description;
  }
}

export class Standard {

  public static output(issues: Array<Issue>): string {
    let tuples: Array<Tuple> = [];
    for (let issue of issues) {
      tuples.push(this.build_tuple(issue));
    }

    let result = this.columns(tuples);

    return result + Total.output(issues);
  }

  private static columns(tuples: Array<Tuple>): string {
    let max = 0;
    tuples.forEach((tuple) => { if (max < tuple.filename.length) { max = tuple.filename.length; }; });

    let result = "";
    tuples.forEach((tuple) => {
      result = result +
        this.pad(tuple.filename, max - tuple.filename.length) +
        tuple.description + "\n"; });

    return result;
  }

  private static pad(input: string, length: number): string {
    let output = input;
    for (let i = 0; i < length; i++) {
      output = output + " ";
    }
    return output + " - ";
  }

  private static build_tuple(issue: Issue): Tuple {
    return new Tuple(issue.getFile().getFilename() +
                     "[" + issue.getStart().getRow() + ", " + issue.getStart().getCol() + "]",
                     issue.getDescription());
  }
}