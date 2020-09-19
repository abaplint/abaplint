import {IRule, IRuleMetadata} from "./_irule";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";
import {IRegistry} from "../_iregistry";

export class AllowedObjectTypesConf extends BasicRuleConfig {
  /** List of allowed object types, example: ["CLAS", "INTF"] */
  public allowed: string[] = [];
}

export class AllowedObjectTypes implements IRule {

  private conf = new AllowedObjectTypesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "allowed_object_types",
      title: "Check allowed object types",
      shortDescription: `Restricts the set of allowed object types.`,
      extendedInformation: `allowed is a list of 4 character object types, example: ["CLAS", "INTF"]`,
    };
  }

  public initialize(_reg: IRegistry) {
    return this;
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
      const position = new Position(1, 1);
      const issue = Issue.atPosition(
        obj.getFiles()[0],
        position,
        this.getDescription(objectType),
        this.getMetadata().key,
        this.conf.severity);

      return [issue];
    }

    return [];
  }

}