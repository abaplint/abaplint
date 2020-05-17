import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {ClassAttribute} from "../abap/types";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Visibility} from "../abap/4_object_information/visibility";

export class NoPublicAttributesConf extends BasicRuleConfig {
  /** Allows public attributes, if they are declared as READ-ONLY. */
  public allowReadOnly: boolean = false;
}

export class NoPublicAttributes extends ABAPRule {

  private conf = new NoPublicAttributesConf();
  private rows: string[] = [];

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
    this.rows = file.getRawRows();
    this.file = file;

    const attributes = this.getAllPublicAttributes();
    return this.findAllIssues(attributes);
  }

  private getAllPublicAttributes(): ClassAttribute[] {
    let attributes: ClassAttribute[] = [];
    attributes = attributes.concat(this.getAllPublicClassAttributes());
    attributes = attributes.concat(this.getAllPublicInterfaceAttributes());
    return attributes;
  }

  private getAllPublicClassAttributes(): ClassAttribute[] {
    let attributes: ClassAttribute[] = [];
    for (const classDef of this.file.getInfo().getClassDefinitions()) {
      if (classDef.isException()) {
        continue;
      }
      const attr = classDef.getAttributes();
      attributes = attributes.concat(attr.getInstancesByVisibility(Visibility.Public));
      attributes = attributes.concat(attr.getStaticsByVisibility(Visibility.Public));
    }
    return attributes;
  }

  private getAllPublicInterfaceAttributes(): ClassAttribute[] {
    let attributes: ClassAttribute[] = [];
    for (const interfaceDef of this.file.getInfo().getInterfaceDefinitions()) {
      const attr = interfaceDef.getAttributes();
      if (attr) {
        attributes = attributes.concat(attr.getInstancesByVisibility(Visibility.Public));
        attributes = attributes.concat(attr.getStaticsByVisibility(Visibility.Public));
      }
    }
    return attributes;
  }

  private findAllIssues(attributes: ClassAttribute[]): Issue[] {
    const issues: Issue[] = [];
    for (const attr of attributes) {
      if ((this.conf.allowReadOnly === true) && this.isAttributeReadOnly(attr)) {
        continue;
      }
      const issue = Issue.atIdentifier(attr, this.getDescription(attr.getName()), this.getMetadata().key);
      issues.push(issue);
    }
    return issues;
  }

  private isAttributeReadOnly(attribute: ClassAttribute): boolean {
    const rowNum = attribute.getStart().getRow();
    const row = this.rows[rowNum - 1] + this.rows[rowNum];
    return row.includes("READ-ONLY");
  }
}