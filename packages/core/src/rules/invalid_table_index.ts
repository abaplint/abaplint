import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper} from "../edit_helper";


export class InvalidTableIndexConf extends BasicRuleConfig {
}

export class InvalidTableIndex extends ABAPRule {
  private conf = new InvalidTableIndexConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "invalid_table_index",
      title: "Invalid Table Index",
      shortDescription: `Issues error for constant table index zero, as ABAP starts from 1`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `DATA(first) = table[ 0 ].`,
      goodExample: `DATA(first) = table[ 1 ].`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: InvalidTableIndexConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues; // parser error
    }

    const expr = stru.findAllExpressionsRecursive(Expressions.TableExpression);
    for (const e of expr) {
      const token = e.findDirectExpression(Expressions.Source)
        ?.findDirectExpression(Expressions.Constant)
        ?.findFirstExpression(Expressions.Integer)?.getFirstToken();
      if (token === undefined) {
        continue;
      }
      if (token.getStr() === "0") {
        const message = "Table index starts from 1";
        const fix = EditHelper.replaceToken(file, token, "1");
        const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity, fix);
        issues.push(issue);
      }
    }

    return issues;
  }
}
