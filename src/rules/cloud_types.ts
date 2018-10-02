import {IRule} from "./rule";
import {Issue} from "../issue";
import {Version} from "../version";
import * as Objects from "../objects";

export class CloudTypesConf {
  public enabled: boolean = true;
}

export class CloudTypes implements IRule {

  private conf = new CloudTypesConf();

  public getKey(): string {
    return "cloud_types";
  }

  public getDescription(): string {
    return "Object type not supported in cloud";
  }

  public getMessage(_number): string {
    return this.getDescription();
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(obj, _reg, ver) {
    if (ver !== Version.Cloud
        || obj instanceof Objects.Class
        || obj instanceof Objects.Interface
        || obj instanceof Objects.MessageClass
        || obj instanceof Objects.Package
        || obj instanceof Objects.Table
        || obj instanceof Objects.DataDefinition
        || obj instanceof Objects.DataControl
        || obj instanceof Objects.LockObject
        || obj instanceof Objects.Transformation
        || obj instanceof Objects.FunctionGroup
        || obj instanceof Objects.DataElement
        || obj instanceof Objects.Domain) {
      return [];
    }

    return [new Issue(this, obj.getFiles()[0], 1)];
  }

}