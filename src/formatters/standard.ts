import Issue from "../issue";
import {File} from "../file";
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

  public static output(files: Array<File>): string {
    let tuples: Array<Tuple> = [];
    for (let file of files) {
      for (let issue of file.getIssues()) {
        tuples.push(this.build_tuple(file, issue));
      }
    }

    let result = this.columns(tuples);

    return result + Total.output(files);
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

  private static build_tuple(file: File, issue: Issue): Tuple {
    return new Tuple(file.getFilename() +
                     "[" + issue.getStart().getRow() + ", " + issue.getStart().getCol() + "]",
                     issue.getDescription());
  }
}