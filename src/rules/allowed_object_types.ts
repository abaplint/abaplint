import {IRule} from "./_irule";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Restricts the set of allowed object types. */
export class AllowedObjectTypesConf extends BasicRuleConfig {
  public allowed: string[] = [];
}

export class AllowedObjectTypes implements IRule {

  private conf = new AllowedObjectTypesConf();

  public getKey(): string {
    return "allowed_object_types";
  }

  private getDescription(objectType: string): string {
    return "Object type " + objectType + " not allowed.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AllowedObjectTypesConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const allowed = this.getConfig().allowed;
    if (allowed === undefined || allowed.length === 0) {
      return [];
    }

    const objectType = obj.getType();
    if (allowed.indexOf(objectType) < 0) {
      return [new Issue({
        file: obj.getFiles()[0],
        key: this.getKey(),
        message: this.getDescription(objectType)})];
    }

    return [];
  }

}