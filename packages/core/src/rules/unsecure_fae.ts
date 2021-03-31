import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";

export class UnsecureFAEConf extends BasicRuleConfig {
}

export class UnsecureFAE implements IRule {
  private reg: IRegistry;
  private conf = new UnsecureFAEConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unsecure_fae",
      title: "Unsecure FAE",
      shortDescription: `Checks for Unsecure FAE`,
      extendedInformation: `Issues from rule check_syntax must be fixed before this rule takes effect`,
      tags: [RuleTag.Experimental],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: UnsecureFAEConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];
    if (!(obj instanceof ABAPObject)) {
      return issues;
    }

    const syntaxResult = new SyntaxLogic(this.reg, obj).run();
    if (syntaxResult.issues.length > 0) {
      return issues;
    }

    for (const f of obj.getABAPFiles()) {
      // todo
      for (const e of f.getStructure()?.findAllExpressions(Expressions.SQLForAllEntries) || []) {
        const token = e.getFirstToken();
        const message = "Unsecure FAE";
        issues.push(Issue.atToken(f, token, message, this.getMetadata().key, this.getConfig().severity));
      }
    }

    return issues;
  }

}