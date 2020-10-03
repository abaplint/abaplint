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
https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-the-parameter-name-in-single-parameter-calls`,
      tags: [RuleTag.Styleguide],
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
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;

    for (const file of obj.getABAPFiles()) {
      const stru = file.getStructure();
      if (stru === undefined) {
        continue;
      }

      for (const c of stru.findAllExpressions(Expressions.MethodCall)) {
        const name = c.findDirectExpression(Expressions.MethodName);
        const param = c.findDirectExpression(Expressions.MethodCallParam);
        if (name === undefined
            || param === undefined) {
          continue;
        }

        const ref = this.findMethodReference(name.getFirstToken(), spaghetti, file.getFilename());
        if (ref === undefined) {
          continue;
        }

        const i = ref.getParameters().getDefaultImporting();
        const p = param.concatTokens().toUpperCase();

        if (p.startsWith("( " + i + " = ")) {
          const message = "Omit default parameter name \"" + i + "\"";
          issues.push(Issue.atToken(file, name.getFirstToken(), message, this.getMetadata().key, this.getConfig().severity));
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