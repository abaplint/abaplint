import { IRule } from "./rule";
import File from "../file";
import Issue from "../issue";

export class FunctionalWritingConf {
  public enabled: boolean = true;
}

export class FunctionalWriting implements IRule {

  private conf = new FunctionalWritingConf();

  public getKey(): string {
    return "functional_writing";
  }

  public getDescription(): string {
    return "Use functional writing style";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    for (let statement of file.getStatements()) {
      let code = statement.concatTokens().toUpperCase();
      if (this.startsWith(code, "CALL METHOD ")) {
        if (/\)[=-]>/.test(code) === true
            || /[=-]>\(/.test(code) === true) {
          continue;
        }
        let issue = new Issue(this, statement.getStart(), file);
        file.add(issue);
      }
    }
  }

  private startsWith(str: string, value: string): boolean {
    return str.substr(0, value.length) === value;
  }

}