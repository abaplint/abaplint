import {IRule} from "./rule";
import {Issue} from "../issue";
import {ABAPObject} from "../objects";

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

  public run(obj) {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {
      for (let statement of file.getStatements()) {
        let code = statement.concatTokens().toUpperCase();
        if (this.startsWith(code, "CALL METHOD ")) {
          if (/\)[=-]>/.test(code) === true
              || /[=-]>\(/.test(code) === true
              || this.startsWith(code, "CALL METHOD (")) {
            continue;
          }
          let issue = new Issue(this, file, statement.getStart());
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  private startsWith(str: string, value: string): boolean {
    return str.substr(0, value.length) === value;
  }

}