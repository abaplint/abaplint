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

The quick fix REMOVES the addition rather than making the parameter optional.
The compiler's own wording suggests the opposite, and that is the more
dangerous of the two: making a mandatory parameter optional widens the
contract, so a call that forgets it compiles and the method runs on an
unfilled parameter. Removing an addition that is already ignored changes
nothing at all.`,
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

      const mandatory = this.firstMandatory(importing);
      if (mandatory === undefined) {
        continue;
      }

      const fix: IEdit = EditHelper.replaceRange(file,
                                                 preferred.start, preferred.end, "");
      const message = `PREFERRED PARAMETER is ignored while ${mandatory} is not optional`;
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

  /** The first importing parameter that is neither OPTIONAL nor has a
   *  DEFAULT, or undefined when every one of them may be left out. */
  private firstMandatory(importing: ExpressionNode): string | undefined {
    for (const param of importing.findDirectExpressions(Expressions.MethodParamOptional)) {
      const concat = param.concatTokens().toUpperCase();
      if (concat.endsWith(" OPTIONAL") || concat.includes(" DEFAULT ")) {
        continue;
      }
      const name = param.findFirstExpression(Expressions.MethodParamName)?.concatTokens();
      return name ?? param.concatTokens();
    }
    return undefined;
  }

}
