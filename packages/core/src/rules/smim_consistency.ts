import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {MIMEObject} from "../objects";
import {IRule, IRuleMetadata} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Position} from "../position";

export class SMIMConsistencyConf extends BasicRuleConfig {
}

export class SMIMConsistency implements IRule {
  private conf = new SMIMConsistencyConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "smim_consistency",
      title: "SMIM consistency check",
      shortDescription: `SMIM consistency check`,
      extendedInformation: "Check folders exists",
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SMIMConsistencyConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];

    if (!(obj instanceof MIMEObject)) {
      return [];
    }

    const base = this.base(obj.getURL() || "");
    if (base !== "" && this.findFolder(base) === false) {
      const message = `Parent folder "${base}" not found`;
      const position = new Position(1, 1);
      const issue = Issue.atPosition(obj.getFiles()[0], position, message, this.getMetadata().key, this.conf.severity);
      issues.push(issue);
    }

    return issues;
  }

  private base(full: string): string {
    const components = full.split("/");
    components.pop();
    return components.join("/");
  }

  private findFolder(base: string): boolean {
    for (const smim of this.reg.getObjectsByType("SMIM")) {
      const mime = smim as MIMEObject;
      if (base === mime.getURL() && mime.isFolder() === true) {
        return true;
      }
    }
    return false;
  }
}