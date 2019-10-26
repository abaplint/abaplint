import {Issue} from "../../issue";
import {IObject} from "../../objects/_iobject";
import {Class} from "../../objects";
import {Registry} from "../../registry";
import {Attributes} from "../../abap/types/class_attributes";
import {ClassAttribute} from "../../abap/types/class_attribute";
import {NamingRuleConfig} from "../_naming_rule_config";
import {IRule} from "../_irule";
import {NameValidator} from "../../utils/name_validator";
import {Scope} from "../../abap/syntax/_scope";

/** Allows you to enforce a pattern, such as a prefix, for class variable names. */
export class ClassAttributeNamesConf extends NamingRuleConfig {
  public ignoreExceptions: boolean = true;
  /** The pattern for static variable names */
  public statics: string = "^G._.*$";
  /** The pattern for instance variable names */
  public instance: string = "^M._.*$";
}

export class ClassAttributeNames implements IRule {

  private conf = new ClassAttributeNamesConf();

  public getKey(): string {
    return "class_attribute_names";
  }

  private getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
      "Class attribute name does not match pattern " + expected + ": " + actual :
      "Class attribute name must not match pattern " + expected + ": " + actual ;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ClassAttributeNamesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: Registry): Issue[] {
    let attr: Attributes | undefined = undefined;

// todo, consider local classes(PROG, FUGR, CLAS)

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined) {
        return [];
      }
      if (this.conf.ignoreExceptions && definition.isException()) {
        return [];
      }
      attr = definition.getAttributes(Scope.buildDefault(reg));
      if (attr === undefined) {
        return [];
      }
// todo, INTF
//    } else if (obj instanceof Interface) {
//      methods = obj();
    }


    return this.checkAttributes(attr);
  }

  private checkAttributes(attr: Attributes | undefined): Issue[] {
    if (!attr) { return []; }
    let ret: Issue[] = [];

    for (const ins of attr.getInstance()) {
      ret = ret.concat(this.checkName(ins, this.conf.instance));
    }

    for (const sta of attr.getStatic()) {
      ret = ret.concat(this.checkName(sta, this.conf.statics));
    }

    return ret;
  }

  private checkName(attr: ClassAttribute, expected: string): Issue[] {
    const ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = attr.getName();
    if (NameValidator.violatesRule(name, regex, this.conf)) {
      const issue = Issue.atIdentifier(attr, this.getDescription(name, expected), this.getKey());
      ret.push(issue);
    }

    return ret;
  }

}