import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";

export class FunctionalWritingConf {
  public enabled: boolean = true;
}

export class FunctionalWriting implements Rule {

    private conf = new FunctionalWritingConf();

    public get_key(): string {
        return "functional_writing";
    }

    public get_description(): string {
        return "Use functional writing style";
    }

    public get_config() {
        return this.conf;
    }

    public set_config(conf) {
        this.conf = conf;
    }

    private startsWith(string: string, value: string): boolean {
        return string.substr(0, value.length) === value;
    }

    public run(file: File) {
        for (let statement of file.get_statements()) {
            let code = statement.concat_tokens().toUpperCase();
            if(this.startsWith(code, "CALL METHOD ")) {
                if (/\)[=-]>/.test(code) === true
                        || /[=-]>\(/.test(code) === true) {
                    continue;
                }
                let issue = new Issue(this, statement.get_start(), file);
                file.add(issue);
            }
        }
    }

}