import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {IRegistry} from "../_iregistry";
import {IRuleMetadata, RuleTag} from "./_irule";
import {Version} from "../version";

export class PreferInlineConf extends BasicRuleConfig {

}

export class PreferInline extends ABAPRule {

  private conf = new PreferInlineConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_inline",
      title: "Prefer Inline Declarations",
      shortDescription: `Prefer inline to up-front declarations.
Activates if language version is v740sp02 or above.
Variables must be local.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-inline-to-up-front-declarations`,
      tags: [RuleTag.Styleguide, RuleTag.Upport, RuleTag.Experimental],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferInlineConf): void {
    this.conf = conf;
  }

  public runParsed(_file: ABAPFile, reg: IRegistry): Issue[] {

    if (reg.getConfig().getVersion() < Version.v740sp02) {
      return [];
    }


    return [];
  }

}