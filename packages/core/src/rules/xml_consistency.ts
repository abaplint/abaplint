import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import * as Objects from "../objects";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {XMLValidator} from "fast-xml-parser";

export class XMLConsistencyConf extends BasicRuleConfig {
}

export class XMLConsistency implements IRule {

  private conf = new XMLConsistencyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "xml_consistency",
      title: "XML consistency",
      shortDescription: `Checks the consistency of main XML files, eg. naming for CLAS and INTF objects`,
      tags: [RuleTag.Naming, RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: XMLConsistencyConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];

    const file = obj.getXMLFile();
    if (file === undefined) {
      return issues;
    }

    const xml = obj.getXML();
    if (xml) {
      const res = XMLValidator.validate(xml);
      if (res !== true) {
        issues.push(Issue.atRow(file, 1, "XML parser error: " + res.err.msg, this.getMetadata().key, this.conf.severity));
      }
    }

    // todo, have some XML validation in each object?
    if (obj instanceof Objects.Class) {
      const name = obj.getNameFromXML();
      if (name === undefined) {
        issues.push(Issue.atRow(file, 1, "Name undefined in XML", this.getMetadata().key, this.conf.severity));
      } else if (obj.getDescription() && obj.getDescription()!.length > 60) {
        issues.push(Issue.atRow(file, 1, "Description too long", this.getMetadata().key, this.conf.severity));
      } else if (name !== obj.getName().toUpperCase()) {
        issues.push(Issue.atRow(file, 1, "Name in XML does not match object", this.getMetadata().key, this.conf.severity));
      } else if (obj.getMainABAPFile()?.getStructure() !== undefined && obj.getClassDefinition() === undefined) {
        issues.push(Issue.atRow(file, 1, "Class matching XML name not found in ABAP file", this.getMetadata().key, this.conf.severity));
      }
    } else if (obj instanceof Objects.Interface) {
      const name = obj.getNameFromXML();
      if (name === undefined) {
        issues.push(Issue.atRow(file, 1, "Name undefined in XML", this.getMetadata().key, this.conf.severity));
      } else if (obj.getDescription() && obj.getDescription()!.length > 60) {
        issues.push(Issue.atRow(file, 1, "Description too long", this.getMetadata().key, this.conf.severity));
      } else if (name !== obj.getName().toUpperCase()) {
        issues.push(Issue.atRow(file, 1, "Name in XML does not match object", this.getMetadata().key, this.conf.severity));
      } else if (obj.getDefinition() !== undefined && obj.getDefinition()?.getName().toUpperCase() !== name.toUpperCase()) {
        issues.push(Issue.atRow(file, 1, "Interface matching XML name not found in ABAP file", this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}