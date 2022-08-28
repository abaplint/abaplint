import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {Version} from "../version";
import {BasicRuleConfig} from "./_basic_rule_config";
import {DataDefinition} from "../objects";

export class CDSLegacyViewConf extends BasicRuleConfig {
}

export class CDSLegacyView implements IRule {
  private conf = new CDSLegacyViewConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "cds_legacy_view",
      title: "CDS Legacy View",
      shortDescription: `Identify CDS Legacy Views`,
      // eslint-disable-next-line max-len
      extendedInformation: `Use DEFINE VIEW ENTITY instead of DEFINE VIEW

https://blogs.sap.com/2021/10/16/a-new-generation-of-cds-views-how-to-migrate-your-cds-views-to-cds-view-entities/

v755 and up`,
      tags: [RuleTag.SingleFile, RuleTag.Upport],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CDSLegacyViewConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry): IRule {
    this.reg = reg;
    return this;
  }

  public run(o: IObject): Issue[] {
    const issues: Issue[] = [];

    if (this.reg.getConfig().getVersion() < Version.v755
        && this.reg.getConfig().getVersion() !== Version.Cloud) {
      return [];
    }

    if (o.getType() !== "DDLS") {
      return [];
    }

    if (o instanceof DataDefinition) {
      const tree = o.getTree();
      if (tree === undefined) {
        return []; // parser error
      }
      if (tree.findDirectTokenByText("ENTITY") === undefined) {
        const file = o.findSourceFile();
        if (file) {
          issues.push(Issue.atRow(file, 1, "CDS Legacy View", this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return issues;
  }

}