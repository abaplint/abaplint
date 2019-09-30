import {IRule} from "./_irule";
import {Issue} from "../issue";
import {Version} from "../version";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {Registry} from "../registry";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Checks that the package does not contain any object types unsupported in cloud ABAP. */
export class CloudTypesConf extends BasicRuleConfig {
}

export class CloudTypes implements IRule {

  private conf = new CloudTypesConf();

  public getKey(): string {
    return "cloud_types";
  }

  public getDescription(objectType: string): string {
    return "Object type " + objectType + " not supported in cloud";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CloudTypesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: Registry): Issue[] {
    if (reg.getConfig().getVersion() !== Version.Cloud
        || obj instanceof Objects.Class
        || obj instanceof Objects.Interface
        || obj instanceof Objects.MessageClass
        || obj instanceof Objects.Package
        || obj instanceof Objects.Table
        || obj instanceof Objects.TableType
        || obj instanceof Objects.DataDefinition
        || obj instanceof Objects.DataControl
        || obj instanceof Objects.LockObject
        || obj instanceof Objects.Transformation
        || obj instanceof Objects.FunctionGroup
        || obj instanceof Objects.DataElement
        || obj instanceof Objects.Domain) {
      return [];
    }

    return [new Issue({file: obj.getFiles()[0], key: this.getKey(), message: this.getDescription(obj.getType())})];
  }

}