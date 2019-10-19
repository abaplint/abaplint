import {Issue} from "../issue";
import {Empty} from "../abap/statements/_statement";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Checks for empty statements (an empty statement is a single dot) */
export class EmptyStatementConf extends BasicRuleConfig {
}

export class EmptyStatement extends ABAPRule {

  private conf = new EmptyStatementConf();

  public getKey(): string {
    return "empty_statement";
  }

  private getDescription(): string {
    return "Remove empty statement.";
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
        const issue = Issue.atStatement(file, sta, this.getDescription(), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }
}