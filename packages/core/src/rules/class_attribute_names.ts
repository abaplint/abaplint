import {Issue} from "../issue";
import {NamingRuleConfig} from "./_naming_rule_config";
import {NameValidator} from "../utils/name_validator";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Identifier} from "../abap/4_file_information/_identifier";
import {InfoAttribute, AttributeLevel} from "../abap/4_file_information/_abap_file_information";
import {RuleTag} from "./_irule";
import {ABAPObject} from "../objects/_abap_object";
import {DDIC} from "../ddic";

export class ClassAttributeNamesConf extends NamingRuleConfig {
  /** Ignore global exception classes */
  public ignoreExceptions: boolean = true;
  /** Ignore local classes */
  public ignoreLocal: boolean = true;
  /** Ignore interfaces */
  public ignoreInterfaces: boolean = false;
  /** The pattern for static variable names */
  public statics: string = "^G._.+$";
  /** The pattern for instance variable names */
  public instance: string = "^M._.+$";
  /** The pattern for constant variable names */
  public constants: string = "";
}

export class ClassAttributeNames extends ABAPRule {

  private conf = new ClassAttributeNamesConf();

  public getMetadata() {
    return {
      key: "class_attribute_names",
      title: "Class attributes naming",
      shortDescription: `Allows you to enforce a pattern, such as a prefix, for class variable names.`,
      tags: [RuleTag.Naming],
    };
  }

  private getDescription(actual: string, expected: string): string {
    return this.conf.patternKind === "required" ?
      "Class attribute name \"" + actual + "\" does not match pattern " + expected :
      "Class attribute name \"" + actual + "\" must not match pattern " + expected;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ClassAttributeNamesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject): Issue[] {
    let issues: Issue[] = [];
    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }
    let attributes: InfoAttribute[] = [];
    const ddic = new DDIC(this.reg);
    for (const classDef of file.getInfo().listClassDefinitions()) {
      if ((classDef.isLocal && this.conf.ignoreLocal)
        || (ddic.isException(classDef, obj) && this.conf.ignoreExceptions)) {
        continue;
      }
      attributes = attributes.concat(classDef.attributes);
    }

    if (this.conf.ignoreInterfaces === false) {
      for (const intfDef of file.getInfo().listInterfaceDefinitions()) {
        if (intfDef.isLocal && this.conf.ignoreLocal) {
          continue;
        }
        attributes = attributes.concat(intfDef.attributes);
      }
    }

    issues = this.checkAttributes(attributes);
    return issues;
  }

  private checkAttributes(attr: InfoAttribute[] | undefined): Issue[] {
    if (attr === undefined) {
      return [];
    }

    let ret: Issue[] = [];
    for (const a of attr) {
      switch (a.level) {
        case AttributeLevel.Instance:
          ret = ret.concat(this.checkName(a.identifier, this.conf.instance));
          break;
        case AttributeLevel.Static:
          ret = ret.concat(this.checkName(a.identifier, this.conf.statics));
          break;
        case AttributeLevel.Constant:
          ret = ret.concat(this.checkName(a.identifier, this.conf.constants));
          break;
        default:
          break;
      }
    }
    return ret;
  }

  private checkName(attr: Identifier, expected: string): Issue[] {
    const ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = attr.getName();
    if (NameValidator.violatesRule(name, regex, this.conf)) {
      const issue = Issue.atIdentifier(attr, this.getDescription(name, expected), this.getMetadata().key, this.conf.severity);
      ret.push(issue);
    }

    return ret;
  }

}