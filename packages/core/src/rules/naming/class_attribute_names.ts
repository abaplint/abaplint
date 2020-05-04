import {Issue} from "../../issue";
import {IAttributes} from "../../abap/types/_class_attributes";
import {NamingRuleConfig} from "../_naming_rule_config";
import {NameValidator} from "../../utils/name_validator";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../..";
import {Identifier} from "../../abap/types/_identifier";

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
  public constants: string = "^C_.+$";
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
    let attributes: IAttributes[] = [];
    for (const classDef of file.getInfo().getClassDefinitions()) {
      if ((classDef.isLocal() && this.conf.ignoreLocal)
        || (classDef.isException() && this.conf.ignoreExceptions)) {
        continue;
      }
      attributes = attributes.concat(classDef.getAttributes());
    }

    for (const attribute of attributes) {
      issues = issues.concat(this.checkAttributes(attribute));
    }
    return issues;
  }

  //   public run(obj: IObject, _reg: IRegistry): Issue[] {
  //     let attr: IAttributes | undefined = undefined;
  //     if (this.conf.patternKind === undefined) {
  //       this.conf.patternKind = "required";
  //     }
  // // todo, consider local classes(PROG, FUGR, CLAS)

  //     if (obj instanceof Class) {
  //       const definition = obj.getClassDefinition();
  //       if (definition === undefined) {
  //         return [];
  //       }
  //       if (this.conf.ignoreExceptions && definition.isException()) {
  //         return [];
  //       }
  //       attr = definition.getAttributes();
  //       if (attr === undefined) {
  //         return [];
  //       }
  // // todo, INTF
  // //    } else if (obj instanceof Interface) {
  // //      methods = obj();
  //     }


  //     return this.checkAttributes(attr);
  //   }

  private checkAttributes(attr: IAttributes | undefined): Issue[] {
    if (!attr) {return [];}
    let ret: Issue[] = [];

    for (const ins of attr.getInstance()) {
      ret = ret.concat(this.checkName(ins, this.conf.instance));
    }

    for (const sta of attr.getStatic()) {
      ret = ret.concat(this.checkName(sta, this.conf.statics));
    }

    for (const con of attr.getConstants()) {
      ret = ret.concat(this.checkName(con, this.conf.constants));
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