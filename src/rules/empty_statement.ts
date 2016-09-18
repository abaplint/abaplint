import {IRule} from "./rule";
import {ParsedFile} from "../file";
import {Issue} from "../issue";
import {Empty} from "../statements/statement";

export class EmptyStatementConf {
  public enabled: boolean = true;
}

export class EmptyStatement implements IRule {

  private conf = new EmptyStatementConf();

  public getKey(): string {
    return "empty_statement";
  }

  public getDescription(): string {
    return "Empty statement";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(file: ParsedFile) {
    let statements = file.getStatements();
    let issues: Array<Issue> = [];

    for (let sta of statements) {
      if (sta instanceof Empty) {
        let issue = new Issue(this, sta.getStart(), file);
        issues.push(issue);
      }
    }
    return issues;
  }
}