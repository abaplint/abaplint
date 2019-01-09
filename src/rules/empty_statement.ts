import {Issue} from "../issue";
import {Empty} from "../abap/statements/_statement";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

export class EmptyStatementConf extends BasicRuleConfig {
}

export class EmptyStatement extends ABAPRule {

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

  public setConfig(conf: EmptyStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const statements = file.getStatements();

    for (const sta of statements) {
      if (sta.get() instanceof Empty) {
        const issue = new Issue({file, key: this.getKey(), message: this.getDescription(), start: sta.getStart()});
        issues.push(issue);
      }
    }

    return issues;
  }
}