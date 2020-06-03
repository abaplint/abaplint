import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {BasicRuleConfig} from "./_basic_rule_config";

// see note 104010

export class AllowedObjectNamingConf extends BasicRuleConfig {
}

export class AllowedObjectNaming implements IRule {
  private conf = new AllowedObjectNamingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "allowed_object_naming",
      title: "Allowed object naming",
      quickfix: false,
      shortDescription: `Enforces basic name length and namespace restrictions`,
      tags: [RuleTag.Naming],
    };
  }

  public getConfig(): AllowedObjectNamingConf {
    return this.conf;
  }

  public setConfig(conf: AllowedObjectNamingConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const allowed = obj.getAllowedNaming();
    let message = "";

    if (obj.getName().length > allowed.maxLength) {
      message = "Name exceeds max length";
    } else if (allowed.allowNamespace === false && obj.getName().indexOf("/") >= 0) {
      message = "Namespace not allowed for object type";
    } else if (obj.getName().match(/^(\/[A-Z_\d]{3,8}\/)?[A-Z_\d ]+$/i) === null) {
      message = "Name not allowed";
    }

    if (message.length > 0) {
      return [Issue.atRow(obj.getFiles()[0], 1, message, this.getMetadata().key)];
    }

    return [];
  }

}