import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";
import * as Expressions from "../abap/2_statements/expressions";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {Token} from "../abap/1_lexer/tokens/_token";
import {ISpaghettiScope} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {MethodDefinition} from "../abap/types/method_definition";
import {EditHelper, IEdit} from "../edit_helper";

export class OmitParameterNameConf extends BasicRuleConfig {
}

export class OmitParameterName implements IRule {
  private reg: IRegistry;
  private conf = new OmitParameterNameConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "omit_parameter_name",
      title: "Omit parameter name",
      shortDescription: `Omit the parameter name in single parameter calls`,
      extendedInformation: `
https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-the-parameter-name-in-single-parameter-calls

EXPORTING must already be omitted for this rule to take effect, https://rules.abaplint.org/exporting/`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix],
      badExample: `method( param = 2 ).`,
      goodExample: `method( 2 ).`,
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: OmitParameterNameConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];
    if (!(obj instanceof ABAPObject) || obj.getType() === "INTF") {
      return [];
    }

    const spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;

    for (const file of obj.getABAPFiles()) {
      const stru = file.getStructure();
      if (stru === undefined) {
        continue;
      }

      for (const c of stru.findAllExpressions(Expressions.MethodCall)) {
        if (c.findFirstExpression(Expressions.MethodParameters)) {
          continue;
        }
        // hmm, this will break for nested method calls?
        const parameters = c.findAllExpressions(Expressions.ParameterS);
        if (parameters.length > 1 || parameters.length === 0) {
          continue;
        }
        const name = c.findDirectExpression(Expressions.MethodName);
        if (name === undefined) {
          continue;
        }
        const param = c.findDirectExpression(Expressions.MethodCallParam);
        if (param === undefined) {
          continue;
        }

        const ref = this.findMethodReference(name.getFirstToken(), spaghetti, file.getFilename());
        if (ref === undefined) {
          continue;
        }

        const i = ref.getParameters().getDefaultImporting();
        if (i === undefined) {
          continue;
        }
        const p = parameters[0].findDirectExpression(Expressions.ParameterName)?.getFirstToken();

        if (p?.getStr().toUpperCase() === i.toUpperCase()) {
          const message = "Omit default parameter name \"" + i + "\"";
          let fix: IEdit | undefined = undefined;
          const end = parameters[0].findDirectExpression(Expressions.Source)?.getFirstToken().getStart();
          if (end) {
            fix = EditHelper.deleteRange(file, p.getStart(), end);
          }
          issues.push(Issue.atToken(file, name.getFirstToken(), message, this.getMetadata().key, this.getConfig().severity, fix));
        }
      }
    }

    return issues;
  }

///////////////////

  private findMethodReference(token: Token, spaghetti: ISpaghettiScope, filename: string): undefined | MethodDefinition {
    const scope = spaghetti.lookupPosition(token.getStart(), filename);
    if (scope === undefined) {
      return undefined;
    }

    for (const r of scope.getData().references) {
      if (r.referenceType !== ReferenceType.MethodReference) {
        continue;
      } else if (r.position.getStart().equals(token.getStart())
          && r.resolved instanceof MethodDefinition) {
        return r.resolved;
      }
    }

    return undefined;
  }

}