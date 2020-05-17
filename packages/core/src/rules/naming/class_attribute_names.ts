import {Issue} from "../../issue";
import {NamingRuleConfig} from "../_naming_rule_config";
import {NameValidator} from "../../utils/name_validator";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {Identifier} from "../../abap/4_object_information/_identifier";
import {InfoAttribute, AttributeType} from "../../abap/4_object_information/_abap_file_information";

export class ClassAttributeNamesConf extends NamingRuleConfig {
  /** Ignore global exception classes */
  public ignoreExceptions: boolean = true;
  /** Ignore local classes */
  public ignoreLocal: boolean = true;
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
      quickfix: false,
      shortDescription: `Allows you to enforce a pattern, such as a prefix, for class variable names.`,
    };
  }

  private getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
      "Class attribute name does not match pattern " + expected + ": " + actual :
      "Class attribute name must not match pattern " + expected + ": " + actual;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ClassAttributeNamesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    let issues: Issue[] = [];
    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }
    let attributes: InfoAttribute[] = [];
    for (const classDef of file.getInfo().listClassDefinitions()) {
      if ((classDef.isLocal && this.conf.ignoreLocal)
        || (classDef.isException && this.conf.ignoreExceptions)) {
        continue;
      }
      attributes = attributes.concat(classDef.attributes);
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
      switch (a.type) {
        case AttributeType.Instance:
          ret = ret.concat(this.checkName(a.identifier, this.conf.instance));
          break;
        case AttributeType.Static:
          ret = ret.concat(this.checkName(a.identifier, this.conf.statics));
          break;
        case AttributeType.Constant:
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
      const issue = Issue.atIdentifier(attr, this.getDescription(name, expected), this.getMetadata().key);
      ret.push(issue);
    }

    return ret;
  }

}