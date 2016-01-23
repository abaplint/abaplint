import Issue from "../issue";
import File from "../file";

export class Json {

    public static output(files: Array<File>): string {
        let out = [];

        let issues: Array<Issue> = [];
        files.forEach((file) => { issues = issues.concat(file.get_issues()); });

        for (let issue of issues) {
            let single = { type: "issue",
                check_name: issue.get_description(),
                description: issue.get_description(),
                categories: ["Complexity"],
                location: {
                    path: issue.get_filename(),
                    lines: {
                        begin: issue.get_row(),
                        end: issue.get_row(),
                    },
                },
                };
            out.push(single);
        }
        return JSON.stringify(out, undefined, "  ");
    }

}