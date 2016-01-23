import Issue from "../issue";
import File from "../file";
import { Total } from "./total";

export class Standard {

    public static output(files: Array<File>): string {
        let issues: Array<Issue> = [];
        files.forEach((file) => { issues = issues.concat(file.get_issues()); });

        let result = "";
        issues.forEach((issue) => { result = result + this.output_issue(issue); });

        return result + Total.output(files);
    }

    private static output_issue(issue: Issue): string {
        return issue.get_filename() +
            "[" + issue.get_row() + ", " + issue.get_col() + "] \t" +
            issue.get_description() + "\n";
    }
}