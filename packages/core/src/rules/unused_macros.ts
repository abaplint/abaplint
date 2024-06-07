import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";

export class UnusedMacrosConf extends BasicRuleConfig {
  /** skip specific names, case insensitive
   * @uniqueItems true
   */
  public skipNames?: string[] = [];
}

export class UnusedMacros implements IRule {
  private conf = new UnusedMacrosConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_macros",
      title: "Unused macros",
      shortDescription: `Checks for unused macro definitions definitions`,
      tags: [RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnusedMacrosConf) {
    this.conf = conf;
    if (this.conf.skipNames === undefined) {
      this.conf.skipNames = [];
    }
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    const result: Issue[] = [];

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const references = this.reg.getMacroReferences();
    for (const file of obj.getABAPFiles()) {
      for (const macro of references.listDefinitionsByFile(file.getFilename())) {
        const usages = references.listUsagesbyMacro(file.getFilename(), macro.token);

        if (usages.length === 0 && this.conf.skipNames?.includes(macro.token.getStr().toUpperCase()) === false) {
          const message = "Unused macro definition: " + macro.token.getStr();
          result.push(Issue.atToken(file, macro.token, message, this.getMetadata().key, this.conf.severity));
        }
      }
    }

    return result;
  }

}