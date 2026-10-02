import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";
import {ExpressionNode} from "../abap/nodes";

export class PreferredParameterIgnoredConf extends BasicRuleConfig {
}

export class PreferredParameterIgnored extends ABAPRule {
  private conf = new PreferredParameterIgnoredConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "preferred_parameter_ignored",
      title: "PREFERRED PARAMETER is ignored",
      shortDescription: `PREFERRED PARAMETER on an IMPORTING clause that still has a mandatory
parameter. The addition names the parameter a positional call fills, which only
means something when every parameter may be left out - so with a mandatory one
present it does nothing.`,
      extendedInformation: `\`PREFERRED PARAMETER\` names the importing parameter that a call filling exactly
one parameter positionally fills. That question only arises when a parameter
may be LEFT OUT, so the addition is ignored while any importing parameter is
neither \`OPTIONAL\` nor carries a \`DEFAULT\`.

The compiler warns "Declare the parameter as OPTIONAL. The addition PREFERRED
PARAMETER is ignored if non-optional parameters are used", yet it still lets a
call leave the preferred parameter out. So the quick fix declares the mandatory
importing parameters OPTIONAL, as the compiler asks: every call that compiles
today keeps compiling. Removing the addition instead would turn the calls that
leave the preferred parameter out into syntax errors.`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `METHODS meth
  IMPORTING
    val   TYPE string
    other TYPE i OPTIONAL
      PREFERRED PARAMETER val.`,
      goodExample: `METHODS meth
  IMPORTING
    val   TYPE string OPTIONAL
    other TYPE i OPTIONAL
      PREFERRED PARAMETER val.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferredParameterIgnoredConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      const importing = statement.findFirstExpression(Expressions.MethodDefImporting);
      if (importing === undefined) {
        continue;
      }
      const preferred = this.preferredTokens(importing);
      if (preferred === undefined) {
        continue;
      }

      const mandatory = this.mandatoryParameters(importing);
      if (mandatory.length === 0) {
        continue;
      }

      const fix: IEdit = EditHelper.mergeList(mandatory.map(p => EditHelper.insertAt(file, p.getLastToken().getEnd(), " OPTIONAL")));
      const name = mandatory[0].findFirstExpression(Expressions.MethodParamName)?.concatTokens() ?? mandatory[0].concatTokens();
      const message = `PREFERRED PARAMETER is ignored while ${name} is not optional`;
      issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, fix));
    }

    return issues;
  }

////////////////

  /** The span of `PREFERRED PARAMETER <name>`, or undefined when the clause
   *  does not carry the addition. */
  private preferredTokens(importing: ExpressionNode) {
    const tokens = importing.getTokens();
    for (let i = 0; i + 2 < tokens.length; i++) {
      if (tokens[i].getStr().toUpperCase() === "PREFERRED"
          && tokens[i + 1].getStr().toUpperCase() === "PARAMETER") {
        return {start: tokens[i].getStart(), end: tokens[i + 2].getEnd()};
      }
    }
    return undefined;
  }

  /** The importing parameters that are neither OPTIONAL nor have a DEFAULT,
   *  empty when every one of them may be left out. */
  private mandatoryParameters(importing: ExpressionNode): ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const param of importing.findDirectExpressions(Expressions.MethodParamOptional)) {
      const concat = param.concatTokens().toUpperCase();
      if (concat.endsWith(" OPTIONAL") || concat.includes(" DEFAULT ")) {
        continue;
      }
      ret.push(param);
    }
    return ret;
  }

}
