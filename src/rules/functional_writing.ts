import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/statements";

export class FunctionalWritingConf {
  public enabled: boolean = true;
  public ignoreExceptions: boolean = true;
}

export class FunctionalWriting extends ABAPRule {

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

  public setConfig(conf: FunctionalWritingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Array<Issue> = [];
    let exception = false;

    for (let statement of file.getStatements()) {
      let code = statement.concatTokens().toUpperCase();

      if (statement.get() instanceof Statements.ClassImplementation && code.match(/^CLASS .?CX/i) && this.conf.ignoreExceptions) {
        exception = true;
      } else if (statement.get() instanceof Statements.EndClass) {
        exception = false;
      } else if (exception === false && this.startsWith(code, "CALL METHOD ")) {
        if (/\)[=-]>/.test(code) === true
            || /[=-]>\(/.test(code) === true
            || this.startsWith(code, "CALL METHOD (")) {
          continue;
        }
        let issue = new Issue({file, message: this.getDescription(), code: this.getKey(), start: statement.getStart()});
        issues.push(issue);
      }
    }

    return issues;
  }

  private startsWith(str: string, value: string): boolean {
    return str.substr(0, value.length) === value;
  }

}