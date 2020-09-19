import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class, Interface} from "../objects";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";

// standard class CL_OO_CLASS assumes classes have descriptions

export class DescriptionEmptyConf extends BasicRuleConfig {
}

export class DescriptionEmpty implements IRule {

  private conf = new DescriptionEmptyConf();

  public getMetadata() {
    return {
      key: "description_empty",
      title: "Description in class must exist",
      shortDescription: `Ensures descriptions in class metadata exist.`,
    };
  }

  private getDescription(name: string): string {
    return "Description empty in " + name;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DescriptionEmptyConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];

    if (obj instanceof Class || obj instanceof Interface) {
      const description = obj.getDescription();
      let message: string | undefined = undefined;
      if (description === "") {
        message = this.getDescription(obj.getName());
      } else if (description === undefined) {
        message = this.getDescription(obj.getName() + ", class XML file not found") ;
      }
      if (message) {
        const position = new Position(1, 1);
        const issue = Issue.atPosition(obj.getFiles()[0], position, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

}