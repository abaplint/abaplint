import {IRule} from "./rule";
import {Issue} from "../issue";
import {Empty} from "../abap/statements/statement";
import {ABAPObject} from "../objects";

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

  public run(obj) {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {
      let statements = file.getStatements();

      for (let sta of statements) {
        if (sta instanceof Empty) {
          let issue = new Issue(this, file, sta.getStart());
          issues.push(issue);
        }
      }
    }

    return issues;
  }
}