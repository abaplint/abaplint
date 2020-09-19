import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {CyclomaticComplexityStats} from "../utils/cyclomatic_complexity_stats";

export class CyclomaticComplexityConf extends BasicRuleConfig {
  public max: number = 20;
}

export class CyclomaticComplexity implements IRule {

  private conf = new CyclomaticComplexityConf();

  public getMetadata() {
    return {
      key: "cyclomatic_complexity",
      title: "Cyclomatic Complexity",
      shortDescription: `Cyclomatic complexity, only reported for methods`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CyclomaticComplexityConf): void {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];

    const stats = CyclomaticComplexityStats.run(obj);

    for (const s of stats) {
      if (s.count > this.conf.max) {
        const message = "Max cyclomatic complexity reached, " + s.count + ", " + s.name;
        const issue = Issue.atPosition(s.file, s.pos, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }
    return issues;
  }

}