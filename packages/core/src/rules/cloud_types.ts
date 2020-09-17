import {IRule} from "./_irule";
import {Issue} from "../issue";
import {Version} from "../version";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";

export class CloudTypesConf extends BasicRuleConfig {
}

export class CloudTypes implements IRule {
  private reg: IRegistry;
  private conf = new CloudTypesConf();

  public getMetadata() {
    return {
      key: "cloud_types",
      title: "Check cloud types",
      shortDescription: `Checks that the package does not contain any object types unsupported in cloud ABAP.`,
    };
  }

  private getDescription(objectType: string): string {
    return "Object type " + objectType + " not supported in cloud";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CloudTypesConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (this.reg.getConfig().getVersion() !== Version.Cloud
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

    const position = new Position(1, 1);
    const issue = Issue.atPosition(
      obj.getFiles()[0],
      position,
      this.getDescription(obj.getType()),
      this.getMetadata().key,
      this.conf.severity);
    return [issue];
  }

}