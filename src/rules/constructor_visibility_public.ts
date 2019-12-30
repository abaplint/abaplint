import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {Visibility} from "../abap/types";
import {Registry} from "../registry";
import {CurrentScope} from "../abap/syntax/_current_scope";

/** Constructor must be placed in the public section, even if the class is not CREATE PUBLIC.
 * https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#if-your-global-class-is-create-private-leave-the-constructor-public
 * https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abeninstance_constructor_guidl.htm
 */
export class ConstructorVisibilityPublicConf extends BasicRuleConfig {
}

export class ConstructorVisibilityPublic implements IRule {
  private conf = new ConstructorVisibilityPublicConf();

  public getKey(): string {
    return "constructor_visibility_public";
  }

  private getDescription(): string {
    return "Constructor visibility should be public";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ConstructorVisibilityPublicConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: Registry): Issue[] {
    const issues: Issue[] = [];

    if (!(obj instanceof Class)) {
      return [];
    }

    const def = obj.getClassDefinition();
    if (def === undefined) {
      return [];
    }

    const scope = CurrentScope.buildDefault(reg);
    const methods = def.getMethodDefinitions(scope);
    if (methods === undefined) {
      return [];
    }

    for (const method of methods.getAll()) {
      if (method.getName().toUpperCase() === "CONSTRUCTOR"
          && method.getVisibility() !== Visibility.Public) {
        const issue = Issue.atIdentifier(method, this.getDescription(), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }
}