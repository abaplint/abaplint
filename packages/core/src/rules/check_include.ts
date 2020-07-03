import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject} from "../objects/_abap_object";
import {IncludeGraph} from "../utils/include_graph";
import {IRule, RuleTag} from "./_irule";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";

export class CheckIncludeConf extends BasicRuleConfig {
}

export class CheckInclude implements IRule {
  private reg: IRegistry;
  private conf = new CheckIncludeConf();

  public getMetadata() {
    return {
      key: "check_include",
      title: "Check INCLUDEs",
      shortDescription: `Checks INCLUDE statements`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckIncludeConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let ret: Issue[] = [];
    const graph = new IncludeGraph(this.reg);
    for (const file of obj.getABAPFiles()) {
      ret = ret.concat(graph.getIssuesFile(file));
    }
    return ret;
  }

}