import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {Scope} from "../abap/types";

export class NoPublicAttributesConf extends BasicRuleConfig {
// todo,  public allowReadOnly: boolean = false;
}

export class NoPublicAttributes implements IRule {
  private conf = new NoPublicAttributesConf();

  public getKey(): string {
    return "no_public_attributes";
  }

  public getDescription(): string {
    return "No public attributes";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoPublicAttributesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    const issues: Issue[] = [];

// todo: also implement for interfaces
    if (!(obj instanceof Class)) {
      return [];
    }

    const def = obj.getClassDefinition();
    if (def === undefined || def.isException()) {
      return [];
    }

    const attrs = def.getAttributes();
    if (attrs === undefined) {
      return [];
    }

    for (const attr of attrs.getInstance().concat(attrs.getStatic())) {
      if (attr.getScope() === Scope.Public) {
        const message = this.getDescription() + ", " + attr.getName();
        issues.push(new Issue({file: obj.getFiles()[0],
          message, key: this.getKey(), start: attr.getPosition()}));
      }
    }

    return issues;
  }
}