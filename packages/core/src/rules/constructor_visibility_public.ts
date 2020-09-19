import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {Visibility} from "../abap/4_file_information/visibility";
import {IRegistry} from "../_iregistry";

export class ConstructorVisibilityPublicConf extends BasicRuleConfig {
}

export class ConstructorVisibilityPublic implements IRule {
  private conf = new ConstructorVisibilityPublicConf();

  public getMetadata() {
    return {
      key: "constructor_visibility_public",
      title: "Check constructor visibility is public",
      shortDescription: `Constructor must be placed in the public section, even if the class is not CREATE PUBLIC.`,
      extendedInformation:
`https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#if-your-global-class-is-create-private-leave-the-constructor-public
https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abeninstance_constructor_guidl.htm`,
      tags: [RuleTag.Styleguide],
    };
  }

  private getMessage(): string {
    return "Constructor visibility should be public";
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public setConfig(conf: ConstructorVisibilityPublicConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];

    if (!(obj instanceof Class)) {
      return [];
    }

    const def = obj.getClassDefinition();
    if (def === undefined) {
      return [];
    }

    for (const method of def.methods) {
      if (method.name.toUpperCase() === "CONSTRUCTOR"
          && method.visibility !== Visibility.Public) {
        const issue = Issue.atIdentifier(method.identifier, this.getMessage(), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }
}