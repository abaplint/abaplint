import Issue from "../issue";
import File from "../file";
import { Total } from "./total";

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
        let issues: Array<Issue> = [];
        files.forEach((file) => { issues = issues.concat(file.get_issues()); });

        let tuples: Array<Tuple> = [];
        issues.forEach((issue) => { tuples = tuples.concat(this.output_tuple(issue)); });

        let max = 0;
        tuples.forEach((tuple) => { if (max < tuple.filename.length) { max = tuple.filename.length; }; });

        let result = "";
        tuples.forEach((tuple) => {
            result = result +
                this.pad(tuple.filename, max - tuple.filename.length) +
                tuple.description + "\n"; });

        return result + Total.output(files);
    }

    private static pad(input: string, length: number): string {
        let output = input;
        for (let i = 0; i < length; i++) {
            output = output + " ";
        }
        return output + " - ";
    }

    private static output_tuple(issue: Issue): Tuple {
        return new Tuple(issue.get_filename() +
                         "[" + issue.get_row() + ", " + issue.get_col() + "]",
                         issue.get_description());
    }
}