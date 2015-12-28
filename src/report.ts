import Issue from "./issue";

export default class Report {
    private issues: Array<Issue> = [];

    public add(issue: Issue) {
        this.issues.push(issue);
    }

    public get_count(): number {
        return this.issues.length;
    }

    public json() {
        let out = [];

        for (let issue of this.issues) {
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
        let str = JSON.stringify(out, undefined, "  ");
        console.log(str);
    }

    public output() {
        console.log("abaplint");

        for (let issue of this.issues) {
            this.output_issue(issue);
        }
        console.log(this.get_count() + " issue(s) found");
    }

    private output_issue(issue: Issue) {
        console.error("  " +
                      issue.get_filename() + "\t" +
                      "line: " + issue.get_row() + "\t" +
                      issue.get_description());
    }
}