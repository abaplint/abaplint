import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {Registry} from "../registry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";

// standard class CL_OO_CLASS assumes classes have descriptions

export class DescriptionEmptyConf extends BasicRuleConfig {
}

export class DescriptionEmpty implements IRule {

  private conf = new DescriptionEmptyConf();

  public getKey(): string {
    return "description_empty";
  }

  public getDescription(): string {
    return "Description empty";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DescriptionEmptyConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    const issues: Issue[] = [];

    if (obj instanceof Class) {
      if (obj.getDescription() === "") {
        const issue = new Issue({file: obj.getFiles()[0], message: this.getDescription(), key: this.getKey(), start: new Position(1, 1)});
        issues.push(issue);
      }
    }
// todo, add INTF

    return issues;
  }

}