import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject} from "../objects/_abap_object";
import {IncludeGraph} from "../utils/include_graph";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {Program} from "../objects";
import {Severity} from "../severity";

export class CheckIncludeConf extends BasicRuleConfig {
  public allowUnused?: boolean = false;
}

export class CheckInclude implements IRule {
  private reg: IRegistry;
  private conf = new CheckIncludeConf();
  private graph: IncludeGraph;

  public getMetadata(): IRuleMetadata {
    return {
      key: "check_include",
      title: "Check INCLUDEs",
      shortDescription: `Checks INCLUDE statements`,
      extendedInformation: `
* Reports unused includes
* Errors if the includes are not found
* Error if including a main program
* Skips ZX* includes`,
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
    this.graph = new IncludeGraph(this.reg, this.getConfig().severity || Severity.Error, this.getConfig().allowUnused || false);
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    if (obj instanceof Program && obj.isInclude() === true && obj.getName().startsWith("ZX")) {
      return [];
    }

    let ret: Issue[] = [];
    for (const file of obj.getABAPFiles()) {
      ret = ret.concat(this.graph.getIssuesFile(file));
    }
    return ret;
  }

}