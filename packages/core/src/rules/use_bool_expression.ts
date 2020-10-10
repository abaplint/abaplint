import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Version} from "../version";
import {IRuleMetadata, RuleTag} from "./_irule";
import {EditHelper} from "../edit_helper";
import {ABAPFile} from "../abap/abap_file";

// note this rule assumes abap_true and abap_false is used for boolean variables
// some other rule will in the future find assignments to abap_bool that are not abap_true/abap_false/abap_undefined

export class UseBoolExpressionConf extends BasicRuleConfig {
}

export class UseBoolExpression extends ABAPRule {
  private conf = new UseBoolExpressionConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "use_bool_expression",
      title: "Use boolean expression",
      shortDescription: `Use boolean expression, xsdbool from 740sp08 and up, boolc from 702 and up`,
      extendedInformation:
        `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#use-xsdbool-to-set-boolean-variables`,
      tags: [RuleTag.Upport, RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `IF line IS INITIAL.
  has_entries = abap_false.
ELSE.
  has_entries = abap_true.
ENDIF.`,
      goodExample: `DATA(has_entries) = xsdbool( line IS NOT INITIAL ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UseBoolExpressionConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    const stru = file.getStructure();

    if (stru === undefined || this.reg.getConfig().getVersion() < Version.v702) {
      return [];
    }

    for (const i of stru.findAllStructures(Structures.If)) {
      if (i.findDirectStructure(Structures.ElseIf) !== undefined) {
        continue;
      }

      const bodyNodes = i.findDirectStructure(Structures.Body)?.findAllStatementNodes();
      if (bodyNodes === undefined || bodyNodes.length !== 1) {
        continue;
      }
      const bodyStatement = bodyNodes[0];
      if (!(bodyStatement.get() instanceof Statements.Move)) {
        continue;
      }

      const elseNodes = i.findDirectStructure(Structures.Else)?.findDirectStructure(Structures.Body)?.findAllStatementNodes();
      if (elseNodes === undefined || elseNodes.length !== 1) {
        continue;
      }
      const elseStatement = elseNodes[0];
      if (!(elseStatement.get() instanceof Statements.Move)) {
        continue;
      }

      const bodyTarget = bodyStatement.findFirstExpression(Expressions.Target)?.concatTokens();
      const elseTarget = elseStatement.findFirstExpression(Expressions.Target)?.concatTokens();
      if (bodyTarget === undefined || elseTarget === undefined || bodyTarget.toUpperCase() !== elseTarget.toUpperCase()) {
        continue;
      }

      const bodySource = bodyStatement.findFirstExpression(Expressions.Source)?.concatTokens().toUpperCase();
      const elseSource = elseStatement.findFirstExpression(Expressions.Source)?.concatTokens().toUpperCase();
      if ((bodySource === "ABAP_TRUE" && elseSource === "ABAP_FALSE")
          || (bodySource === "ABAP_FALSE" && elseSource === "ABAP_TRUE")) {
        const func = this.reg.getConfig().getVersion() >= Version.v740sp08 ? "xsdbool" : "boolc";
        const negate = bodySource === "ABAP_FALSE";
        const message = `Use ${func} instead of IF` + (negate ? ", negate expression" : "");
        const start = i.getFirstToken().getStart();
        const end = i.getLastToken().getEnd();

        const statement = bodyTarget + " = " + func + "( " +
          (negate ? "NOT ( " : "") +
          i.findFirstStatement(Statements.If)?.findFirstExpression(Expressions.Cond)?.concatTokens() +
          (negate ? " )" : "") +
          " ).";
        const fix = EditHelper.replaceRange(file, start, end, statement);
        issues.push(Issue.atRange(file, start, end, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return issues;
  }


}