import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {Visibility} from "../abap/types";

export class ConstructorVisibilityPublicConf extends BasicRuleConfig {
}

export class ConstructorVisibilityPublic implements IRule {
  private conf = new ConstructorVisibilityPublicConf();

  public getKey(): string {
    return "constructor_visibility_public";
  }

  public getDescription(): string {
    return "Constructor visibility should be public";
  }

  public getConfig() {
    return this.conf;
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

    const methods = def.getMethodDefinitions();
    if (methods === undefined) {
      return [];
    }

    for (const method of methods.getAll()) {
      if (method.getName().toUpperCase() === "CONSTRUCTOR"
          && method.getVisibility() !== Visibility.Public) {
        const message = this.getDescription();
        issues.push(new Issue({file: obj.getFiles()[0],
          message, key: this.getKey(), start: method.getStart()}));
      }
    }

    return issues;
  }
}