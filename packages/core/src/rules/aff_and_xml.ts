import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";

export class AFFAndXMLConf extends BasicRuleConfig {
}

export class AFFAndXML implements IRule {

  private conf = new AFFAndXMLConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "aff_and_xml",
      title: "AFF and XML",
      shortDescription: `Checks for objects that have both AFF (.json) and XML (.xml) files`,
      extendedInformation: `If an object has both an ABAP file format JSON file and an XML file, the XML file should be removed`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AFFAndXMLConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    const files = obj.getFiles();

    let hasJSON = false;
    let hasXML = false;
    const type = obj.getType().toLowerCase();

    for (const file of files) {
      const filename = file.getFilename().toLowerCase();
      if (filename.endsWith("." + type + ".json")) {
        hasJSON = true;
      } else if (filename.endsWith("." + type + ".xml")) {
        hasXML = true;
      }
    }

    if (hasJSON && hasXML) {
      const xmlFile = obj.getXMLFile();
      if (xmlFile) {
        const message = "Object has both AFF JSON and XML files, remove the XML";
        return [Issue.atRow(xmlFile, 1, message, this.getMetadata().key, this.conf.severity)];
      }
    }

    return [];
  }

}
