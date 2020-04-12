import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import * as Objects from "../objects";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Checks the consistency of main XML files, eg. naming */
export class XMLConsistencyConf extends BasicRuleConfig {
}

export class XMLConsistency implements IRule {

  private conf = new XMLConsistencyConf();

  public getMetadata() {
    return {key: "xml_consistency"};
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: XMLConsistencyConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: IRegistry): Issue[] {
    const issues: Issue[] = [];

    const file = obj.getXMLFile();
    if (file === undefined) {
      return issues;
    }

    // todo, check XML consistency, https://github.com/abaplint/abaplint/issues/667

    if (obj instanceof Objects.Class) {
      const name = obj.getNameFromXML();
      if (name === undefined) {
        issues.push(Issue.atRow(file, 1, "Name undefined in XML", this.getMetadata().key));
      } else if (name !== obj.getName().toUpperCase()) {
        issues.push(Issue.atRow(file, 1, "Name in XML does not match object", this.getMetadata().key));
      }
    }
    // todo, add more object types here

    return issues;
  }

}