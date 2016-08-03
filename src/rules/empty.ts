import { IRule } from "./rule";
import File from "../file";
import Issue from "../issue";
import { Empty } from "../statements/statement";

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

  public run(file: File) {
    let statements = file.getStatements();

    for (let sta of statements) {
      if (sta instanceof Empty) {
        let issue = new Issue(this, sta.getStart(), file);
        file.add(issue);
        }
      }
  }
}