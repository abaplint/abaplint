import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {Registry} from "../registry";
import {MethodLengthStats} from "../abap/method_length_stats";
import {IRule} from "./_irule";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Checks relating to method length. */
export class MethodLengthConf extends BasicRuleConfig {
  /** Maximum method length in statements */
  public statements: number = 100;
  /** Checks for empty methods. */
  public errorWhenEmpty: boolean = true;
}

enum IssueType {
  EmptyMethod,
  MaxStatements,
}

export class MethodLength implements IRule {

  private conf = new MethodLengthConf();

  public getKey(): string {
    return "method_length";
  }

  public getDescription(issueType: IssueType, actual: string): string {
    switch (issueType) {
      case IssueType.EmptyMethod: {
        return "Empty Method.";
      }
      case IssueType.MaxStatements: {
        return "Reduce method length to max " + this.conf.statements + " statements, currently " + actual;
      }
      default: {
        return "";
      }
    }
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
      if (s.count === 0 && this.conf.errorWhenEmpty === true) {
        issues.push(new Issue({
          file: s.file,
          message: this.getDescription(IssueType.EmptyMethod, "0"),
          key: this.getKey(),
          start: s.pos,
        }));
        continue;
      }
      if (s.count > this.conf.statements) {
        issues.push(new Issue({
          file: s.file,
          message: this.getDescription(IssueType.MaxStatements, s.count.toString()),
          key: this.getKey(),
          start: s.pos,
        }));
      }
    }
    return issues;
  }

}