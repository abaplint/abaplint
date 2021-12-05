import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";

export class AllowedObjectNamingConf extends BasicRuleConfig {
}

export class AllowedObjectNaming implements IRule {
  private conf = new AllowedObjectNamingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "allowed_object_naming",
      title: "Allowed object naming",
      shortDescription: `Enforces basic name length and namespace restrictions, see note SAP 104010`,
      tags: [RuleTag.Naming, RuleTag.SingleFile],
    };
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public getConfig(): AllowedObjectNamingConf {
    return this.conf;
  }

  public setConfig(conf: AllowedObjectNamingConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const allowed = obj.getAllowedNaming();
    const name = obj.getName();
    let message = "";

    if (name.length > allowed.maxLength) {
      message = "Name exceeds max length";
    } else if (allowed.allowNamespace === false && name.indexOf("/") >= 0) {
      message = "Namespace not allowed for object type";
    } else if (allowed.customRegex !== undefined) {
      if (name.match(allowed.customRegex) === null) {
        message = "Name not allowed";
      }
    } else if (name.match(/^(\/[A-Z_\d]{3,8}\/)?[A-Z_\d<> ]+$/i) === null) {
      message = "Name not allowed";
    }

    if (message.length > 0) {
      return [Issue.atRow(obj.getFiles()[0], 1, message, this.getMetadata().key, this.conf.severity)];
    }

    return [];
  }

}
