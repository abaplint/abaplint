import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Visibility} from "../abap/4_file_information/visibility";
import {InfoAttribute, AttributeLevel} from "../abap/4_file_information/_abap_file_information";

export class NoPublicAttributesConf extends BasicRuleConfig {
  /** Allows public attributes, if they are declared as READ-ONLY. */
  public allowReadOnly: boolean = false;
}

export class NoPublicAttributes extends ABAPRule {
  private conf = new NoPublicAttributesConf();

  private file: ABAPFile;

  public getMetadata() {
    return {
      key: "no_public_attributes",
      title: "No public attributes",
      quickfix: false,
      shortDescription: `Checks that classes and interfaces don't contain any public attributes.
Exceptions are excluded from this rule.`,
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

  public runParsed(file: ABAPFile, _reg: IRegistry) {
    this.file = file;
    const attributes = this.getAllPublicAttributes();
    return this.findAllIssues(attributes);
  }

  private getAllPublicAttributes(): InfoAttribute[] {
    let attributes: InfoAttribute[] = [];
    attributes = attributes.concat(this.getAllPublicClassAttributes());
    attributes = attributes.concat(this.getAllPublicInterfaceAttributes());
    return attributes;
  }

  private getAllPublicClassAttributes(): InfoAttribute[] {
    let attributes: InfoAttribute[] = [];
    for (const classDef of this.file.getInfo().listClassDefinitions()) {
      if (classDef.isException) {
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
      const issue = Issue.atIdentifier(attr.identifier, this.getDescription(attr.name), this.getMetadata().key);
      issues.push(issue);
    }
    return issues;
  }


}