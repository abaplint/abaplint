import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {EditHelper} from "../edit_helper";

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
      badExample: `DEFINE foobar1.
  WRITE 'hello'.
END-OF-DEFINITION.`,
      goodExample: `DEFINE foobar2.
  WRITE 'hello'.
END-OF-DEFINITION.

foobar2.`,
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
      for (const macroToken of references.listDefinitionsByFile(file.getFilename())) {
        const usages = references.listUsagesbyMacro(file.getFilename(), macroToken);

        if (usages.length === 0 && this.conf.skipNames?.includes(macroToken.getStr().toUpperCase()) === false) {
          const message = "Unused macro definition: " + macroToken.getStr();

          const pos = references.getDefinitionPosition(file.getFilename(), macroToken);
          const fix = EditHelper.deleteRange(file, pos!.start, pos!.end);
          result.push(Issue.atToken(file, macroToken, message, this.getMetadata().key, this.conf.severity, fix));
        }
      }
    }

    return result;
  }

}