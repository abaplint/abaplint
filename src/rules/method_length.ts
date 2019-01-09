import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {Registry} from "../registry";
import {MethodLengthStats} from "../stats/method_length_stats";
import {IRule} from "./_irule";
import {BasicRuleConfig} from "./_basic_rule_config";

export class MethodLengthConf extends BasicRuleConfig {
  public statements: number = 100;
}

export class MethodLength implements IRule {

  private conf = new MethodLengthConf();

  public getKey(): string {
    return "method_length";
  }

  public getDescription(): string {
    return "Method length, number of statements";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MethodLengthConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    const issues: Issue[] = [];
    const stats = MethodLengthStats.run(obj);

    for (const s of stats) {
      if (s.count > this.conf.statements) {
        const issue = new Issue({
          file: s.file,
          message: "Reduce method length, " + s.count + " statements",
          key: this.getKey(),
          start: s.pos});
        issues.push(issue);
      }
    }

    return issues;
  }

}