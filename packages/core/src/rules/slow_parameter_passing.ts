import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {IRegistry} from "../_iregistry";
import {SyntaxLogic} from "../abap/5_syntax/syntax";

export class SlowParameterPassingConf extends BasicRuleConfig {
}

export class SlowParameterPassing implements IRule {
  private reg: IRegistry;
  private conf = new SlowParameterPassingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "slow_parameter_passing",
      title: "Slow Parameter Passing",
      shortDescription: `Slow parameter pass`,
      tags: [RuleTag.Performance],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SlowParameterPassingConf): void {
    this.conf = conf;
  }

  public initialize(reg: IRegistry): IRule {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const issues: Issue[] = [];

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    // todo
    new SyntaxLogic(this.reg, obj).run().spaghetti.getTop();

    return issues;
  }

}