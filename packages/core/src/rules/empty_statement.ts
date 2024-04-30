import {Issue} from "../issue";
import {Empty} from "../abap/2_statements/statements/_statement";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {EditHelper} from "../edit_helper";
import {Position} from "../position";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class EmptyStatementConf extends BasicRuleConfig {
}

export class EmptyStatement extends ABAPRule {

  private conf = new EmptyStatementConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "empty_statement",
      title: "Remove empty statement",
      shortDescription: `Checks for empty statements (an empty statement is a single dot)`,
      tags: [RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `WRITE 'hello world'..`,
      goodExample: `WRITE 'hello world'.`,
    };
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

        const issue = Issue.atStatement(file, sta, "Remove empty statement", this.getMetadata().key, this.conf.severity, fix);
        issues.push(issue);
      }

      previousEnd = sta.getLastToken().getEnd();
    }

    return issues;
  }
}