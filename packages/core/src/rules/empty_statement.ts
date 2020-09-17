import {Issue} from "../issue";
import {Empty} from "../abap/2_statements/statements/_statement";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {EditHelper} from "../edit_helper";
import {Position} from "../position";
import {RuleTag} from "./_irule";

export class EmptyStatementConf extends BasicRuleConfig {
}

export class EmptyStatement extends ABAPRule {

  private conf = new EmptyStatementConf();

  public getMetadata() {
    return {
      key: "empty_statement",
      title: "Remove emty statement",
      shortDescription: `Checks for empty statements (an empty statement is a single dot)`,
      tags: [RuleTag.Quickfix],
    };
  }

  private getMessage(): string {
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

    let previousEnd = new Position(1, 1);

    for (const sta of statements) {
      if (sta.get() instanceof Empty) {
        const token = sta.getFirstToken();
        const fix = EditHelper.deleteRange(file, previousEnd, token.getEnd());

        const issue = Issue.atStatement(file, sta, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
        issues.push(issue);
      }

      previousEnd = sta.getLastToken().getEnd();
    }

    return issues;
  }
}