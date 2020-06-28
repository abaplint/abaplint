import {IRegistry} from "../_iregistry";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Issue} from "../issue";
import {RuleTag, IRuleMetadata, IRule} from "./_irule";

export class CheckSyntaxConf extends BasicRuleConfig {
}

export class CheckSyntax implements IRule {
  private reg: IRegistry;
  private conf = new CheckSyntaxConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "check_syntax",
      title: "Check syntax",
      shortDescription: `Enables syntax check and variable resolution`,
      tags: [RuleTag.Experimental, RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: CheckSyntaxConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    return new SyntaxLogic(this.reg, obj).run().issues;
  }

}