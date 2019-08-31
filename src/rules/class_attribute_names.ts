import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {Registry} from "../registry";
import {Attributes} from "../abap/types/class_attributes";
import {ClassAttribute} from "../abap/types/class_attribute";
import {BasicRuleConfig} from "./_basic_rule_config";

export class ClassAttributeNamesConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
  public statics: string = "^G._.*$";
  public instance: string = "^M._.*$";
}

export class ClassAttributeNames implements IRule {

  private conf = new ClassAttributeNamesConf();

  public getKey(): string {
    return "class_attribute_names";
  }

  public getDescription(): string {
    return "Class Attribute Names";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ClassAttributeNamesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
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
      if (definition.getAttributes() === undefined) {
        return [];
      }
      attr = definition.getAttributes();
// todo, INTF
//    } else if (obj instanceof Interface) {
//      methods = obj();
    }


    return this.checkAttributes(attr, obj);
  }

  private checkAttributes(attr: Attributes | undefined, obj: IObject): Issue[] {
    if (!attr) { return []; }
    let ret: Issue[] = [];

    for (const ins of attr.getInstance()) {
      ret = ret.concat(this.checkName(ins, this.conf.instance, obj));
    }

    for (const sta of attr.getStatic()) {
      ret = ret.concat(this.checkName(sta, this.conf.statics, obj));
    }

    return ret;
  }

  private checkName(attr: ClassAttribute, expected: string, obj: IObject): Issue[] {
    const ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = attr.getName();
    if (regex.test(name) === false) {
      const message = "Bad attribute name \"" + name + "\" expected \"" + expected + "/i\"";
// todo, find the right file
      const issue = new Issue({
        file: obj.getFiles()[0],
        message, key: this.getKey(),
        start: attr.getStart(),
        end: attr.getEnd(),
      });
      ret.push(issue);
    }

    return ret;
  }

}