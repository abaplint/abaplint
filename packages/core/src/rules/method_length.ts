import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {MethodLengthStats} from "../utils/method_length_stats";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {BasicRuleConfig} from "./_basic_rule_config";

export class MethodLengthConf extends BasicRuleConfig {
  /** Maximum method length in statements */
  public statements: number = 100;
  /** Checks for empty methods. */
  public errorWhenEmpty: boolean = true;
  /** Option to ignore test classes for this check.  */
  public ignoreTestClasses: boolean = false;
}

enum IssueType {
  EmptyMethod,
  MaxStatements,
}

export class MethodLength implements IRule {

  private conf = new MethodLengthConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "method_length",
      title: "Method Length",
      shortDescription: `Checks relating to method length.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#keep-methods-small`,
      tags: [RuleTag.Styleguide],
    };
  }

  private getDescription(issueType: IssueType, actual: string): string {
    switch (issueType) {
      case IssueType.EmptyMethod: {
        return "Empty method";
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

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];
    const stats = MethodLengthStats.run(obj);
    for (const s of stats) {
      if ((this.conf.ignoreTestClasses === true)
        && s.file.getFilename().includes(".testclasses.")) {
        continue;
      }
      if (s.count === 0 && this.conf.errorWhenEmpty === true) {
        const issue = Issue.atPosition(s.file, s.pos, this.getDescription(IssueType.EmptyMethod, "0"), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
        continue;
      }
      if (s.count > this.conf.statements) {
        const message = this.getDescription(IssueType.MaxStatements, s.count.toString());
        const issue = Issue.atPosition(s.file, s.pos, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }
    return issues;
  }

}