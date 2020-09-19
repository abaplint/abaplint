import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRule} from "./_irule";
import * as Objects from "../objects";
import {Position} from "../position";
import {IRegistry} from "../_iregistry";

export class ReleaseIdocConf extends BasicRuleConfig {
}

export class ReleaseIdoc implements IRule {
  private conf = new ReleaseIdocConf();

  public getMetadata() {
    return {
      key: "release_idoc",
      title: "Release iDoc",
      shortDescription: `Checks idoc types and segments are set to status released`,
    };
  }

  private getMessage(): string {
    return "Idoc type/segement status must be set to released";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ReleaseIdocConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {

    const file = obj.getXMLFile();
    if (file === undefined) {
      return [];
    }

    if (obj instanceof Objects.Table) {
      if (file.getRaw().includes("<SEGMENTDEFINITION>") === false) {
        return [];
      }
    } else if (!(obj instanceof Objects.Idoc)) {
      return [];
    }

    if (file.getRaw().includes("<CLOSED>X</CLOSED>") === false) {
      const position = new Position(1, 1);
      const issue = Issue.atPosition(obj.getFiles()[0], position, this.getMessage(), this.getMetadata().key, this.conf.severity);
      return [issue];
    } else {
      return [];
    }
  }
}