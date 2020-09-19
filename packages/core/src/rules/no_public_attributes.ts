import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Visibility} from "../abap/4_file_information/visibility";
import {InfoAttribute, AttributeLevel} from "../abap/4_file_information/_abap_file_information";
import {ABAPObject} from "../objects/_abap_object";
import {DDIC} from "../ddic";
import {IRuleMetadata, RuleTag} from "./_irule";

export class NoPublicAttributesConf extends BasicRuleConfig {
  /** Allows public attributes, if they are declared as READ-ONLY. */
  public allowReadOnly: boolean = false;
}

export class NoPublicAttributes extends ABAPRule {
  private conf = new NoPublicAttributesConf();

  private file: ABAPFile;

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_public_attributes",
      title: "No public attributes",
      shortDescription: `Checks that classes and interfaces don't contain any public attributes.
Exceptions are excluded from this rule.`,
      extendedInformation:
        `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#members-private-by-default-protected-only-if-needed`,
      tags: [RuleTag.Styleguide],
    };
  }

  public getDescription(name: string): string {
    return "Public attributes are not allowed, attribute \"" + name + "\"";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoPublicAttributesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    this.file = file;
    const attributes = this.getAllPublicAttributes(obj);
    return this.findAllIssues(attributes);
  }

  private getAllPublicAttributes(obj: ABAPObject): InfoAttribute[] {
    let attributes: InfoAttribute[] = [];
    attributes = attributes.concat(this.getAllPublicClassAttributes(obj));
    attributes = attributes.concat(this.getAllPublicInterfaceAttributes());
    return attributes;
  }

  private getAllPublicClassAttributes(obj: ABAPObject): InfoAttribute[] {
    let attributes: InfoAttribute[] = [];
    const ddic = new DDIC(this.reg);
    for (const classDef of this.file.getInfo().listClassDefinitions()) {
      if (ddic.isException(classDef, obj)) {
        continue;
      }
      attributes = attributes.concat(classDef.attributes.filter(a => a.visibility === Visibility.Public));
    }
    return attributes;
  }

  private getAllPublicInterfaceAttributes(): InfoAttribute[] {
    let attributes: InfoAttribute[] = [];
    for (const interfaceDef of this.file.getInfo().listInterfaceDefinitions()) {
      attributes = attributes.concat(interfaceDef.attributes.filter(a => a.visibility === Visibility.Public));
    }
    return attributes;
  }

  private findAllIssues(attributes: InfoAttribute[]): Issue[] {
    const issues: Issue[] = [];
    for (const attr of attributes) {
      if (this.conf.allowReadOnly === true && attr.readOnly) {
        continue;
      } else if (attr.level === AttributeLevel.Constant) {
        continue;
      }
      const issue = Issue.atIdentifier(attr.identifier, this.getDescription(attr.name), this.getMetadata().key, this.conf.severity);
      issues.push(issue);
    }
    return issues;
  }


}