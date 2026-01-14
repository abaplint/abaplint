import {IRule, IRuleMetadata} from "./_irule";
import {Issue} from "../issue";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";

export class FMGlobalParametersObsoleteConf extends BasicRuleConfig {
}

export class FMGlobalParametersObsolete implements IRule {
  private conf = new FMGlobalParametersObsoleteConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "fm_global_parameters_obsolete",
      title: "FM Global Parameters Obsolete",
      shortDescription: `Check for function modules with global parameteers`,
      extendedInformation: `https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/abenglobal_parameters_obsolete.htm`,
      tags: [],
    };
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FMGlobalParametersObsoleteConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof Objects.FunctionGroup)) {
      return [];
    }

    const issues: Issue[] = [];
    for (const module of obj.getModules()) {
      if (module.isGlobalParameters() === true) {
        const file = obj.getMainABAPFile();
        if (file === undefined) {
          continue;
        }
        const message = `Function Module "${module.getName()}" uses obsolete global parameters`;
        issues.push(Issue.atPosition(
          file,
          new Position(1, 1),
          message,
          this.getMetadata().key,
          this.conf.severity,
        ));
      }
    }

    return issues;
  }

}