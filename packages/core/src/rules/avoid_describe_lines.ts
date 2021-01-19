import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";
import {StatementNode} from "../abap/nodes/statement_node";

export class AvoidDescribeLinesConf extends BasicRuleConfig {
}

export class AvoidDescribeLines extends ABAPRule {

  private conf = new AvoidDescribeLinesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "avoid_describe_lines",
      title: "Avoid use of DESCRIBE LINES",
      shortDescription: `Avoid use of DESCRIBE LINES, use lines() instead.`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AvoidDescribeLinesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statementNode of file.getStatements()) {
      if (statementNode.get() instanceof Statements.Describe) {
        const children = statementNode.getChildren();
        if (children.length === 6 && children[3].getFirstToken().getStr().toUpperCase() === "LINES") {
          const message = "DESCRIBE LINES, use lines() instead";
          const fix = this.getFix(file, statementNode);

          issues.push(Issue.atStatement(file, statementNode, message, this.getMetadata().key, this.conf.severity, fix));
        }
      }
    }

    return issues;
  }

  private getFix(file: ABAPFile, statementNode: StatementNode): IEdit|undefined {
    const children = statementNode.getChildren();
    const target = children[4].concatTokens();
    const source = children[2].concatTokens();

    const startPosition = children[0].getFirstToken().getStart();
    const insertText = target + " = lines( " + source + " ).";

    const deleteFix = EditHelper.deleteStatement(file, statementNode);
    const insertFix = EditHelper.insertAt(file, startPosition, insertText);

    const finalFix = EditHelper.merge(deleteFix, insertFix);

    return finalFix;
  }
}
