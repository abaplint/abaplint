import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {Program} from "../objects";
import {Position} from "../position";

export class DynproChecksConf extends BasicRuleConfig {
}

export class DynproChecks implements IRule {
  private conf = new DynproChecksConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "dynpro_checks",
      title: "Dynpro Checks",
      shortDescription: `Various Dynpro checks`,
      extendedInformation: `* Check length of PUSH elements less than 132`,
      tags: [RuleTag.Syntax],
    };
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public getConfig(): DynproChecksConf {
    return this.conf;
  }

  public setConfig(conf: DynproChecksConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const ret: Issue[] = [];

    if (!(obj instanceof Program)) {
      return [];
    }

    const file = obj.getXMLFile();
    if (file === undefined) {
      return [];
    }

    for (const dynpro of obj.getDynpros()) {
      for (const field of dynpro.fields) {
        if (field.type === "PUSH" && field.length > 132) {
          const message = `Screen ${dynpro.number}, field ${field.name} LENGTH longer than 132`;
          ret.push(Issue.atPosition(file, new Position(1, 1), message, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return ret;
  }

}
