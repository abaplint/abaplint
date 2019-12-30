import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {Visibility, ClassAttribute} from "../abap/types";
import {CurrentScope} from "../abap/syntax/_current_scope";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";

/**
 * Checks that classes and interfaces don't contain any public attributes.
 * Exceptions are excluded from this rule.
 */
export class NoPublicAttributesConf extends BasicRuleConfig {
  /** Allows public attributes, if they are declared as READ-ONLY. */
  public allowReadOnly: boolean = false;
}

export class NoPublicAttributes extends ABAPRule {

  private conf = new NoPublicAttributesConf();
  private rows: string[] = [];

  private file: ABAPFile;
  private scope: CurrentScope;

  public getKey(): string {
    return "no_public_attributes";
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

  public runParsed(file: ABAPFile, reg: Registry) {
    this.rows = file.getRawRows();
    this.scope = CurrentScope.buildDefault(reg);
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
    for (const classDef of this.file.getClassDefinitions()) {
      if (classDef.isException()) {
        continue;
      }
      const attr = classDef.getAttributes(this.scope);
      attributes = attributes.concat(attr.getInstancesByVisibility(Visibility.Public));
      attributes = attributes.concat(attr.getStaticsByVisibility(Visibility.Public));
    }
    return attributes;
  }

  private getAllPublicInterfaceAttributes(): ClassAttribute[] {
    let attributes: ClassAttribute[] = [];
    for (const interfaceDef of this.file.getInterfaceDefinitions()) {
      const attr = interfaceDef.getAttributes(this.scope);
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
      const issue = Issue.atIdentifier(attr, this.getDescription(attr.getName()), this.getKey());
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