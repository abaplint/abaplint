import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode} from "../abap/nodes";

export class ChangeIfToCaseConf extends BasicRuleConfig {
}

export class ChangeIfToCase extends ABAPRule {
  private conf = new ChangeIfToCaseConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "change_if_to_case",
      title: "Change IF to CASE",
      shortDescription: `Finds IF constructs that can be changed to CASE`,
      // eslint-disable-next-line max-len
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-case-to-else-if-for-multiple-alternative-conditions`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide],
      badExample: `IF l_fcat-fieldname EQ 'FOO'.
ELSEIF l_fcat-fieldname = 'BAR'
    OR l_fcat-fieldname = 'MOO'.
ENDIF.`,
      goodExample: `CASE l_fcat-fieldname.
  WHEN 'FOO.
  WHEN 'BAR' OR MOO.
ENDCASE.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ChangeIfToCaseConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues;
    }

    for (const i of stru.findAllStructuresRecursive(Structures.If)) {
      const conds: (ExpressionNode | undefined)[] = [];

      const ifStatement = i.findDirectStatement(Statements.If);
      if (ifStatement === undefined) {
        continue;
      }

      conds.push(ifStatement?.findDirectExpression(Expressions.Cond));
      for (const ei of i.findDirectStructures(Structures.ElseIf)) {
        conds.push(ei.findDirectStatement(Statements.ElseIf)?.findDirectExpression(Expressions.Cond));
      }
      if (conds.length === 1) {
        continue;
      }

      const issue = this.analyze(conds);
      if (issue === true) {
        const message = "Change IF to CASE";
        issues.push(Issue.atStatement(file, ifStatement, message, this.getMetadata().key, this.getConfig().severity));
      }
    }

    return issues;
  }

  private analyze(conds: (ExpressionNode | undefined)[]): boolean {
// Scenarios:
// Matching field chain, different constant strings
// Matching field chain, different field chain
    let chain = "";

    for (const c of conds) {
      if (c === undefined) {
        continue;
      }

      if (c.findFirstExpression(Expressions.CondSub)) {
        return false;
      } else if (c.findDirectTokenByText("AND") || c.findDirectTokenByText("EQUIV")) {
        return false;
      }

      for (const compare of c.findAllExpressions(Expressions.Compare)) {
        const op = compare.findDirectExpression(Expressions.CompareOperator)?.concatTokens().toUpperCase();
        if (compare.getChildren().length !== 3) {
          return false;
        } else if (op !== "=" && op !== "EQ") {
          return false;
        }
        const source1 = compare.getChildren()[0]?.concatTokens()?.toUpperCase();
        const source2 = compare.getChildren()[2]?.concatTokens()?.toUpperCase();
        if (source1.startsWith("'") === false) {
          if (chain === "") {
            chain = source1;
          } else if (chain !== source1) {
            return false;
          }
        }
        if (source2.startsWith("'") === false) {
          if (chain === "") {
            chain = source2;
          } else if (chain !== source2) {
            return false;
          }
        }
      }
    }

    return true;
  }

}