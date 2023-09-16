import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {IMethodLengthResult, MethodLengthStats} from "../utils/method_length_stats";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {FormLengthStats} from "../utils/form_length_stats";

export class MethodLengthConf extends BasicRuleConfig {
  /** Maximum method/form length in statements. */
  public statements: number = 100;
  /** Checks for empty methods/forms. */
  public errorWhenEmpty: boolean = true;
  /** Option to ignore test classes for this check. */
  public ignoreTestClasses: boolean = false;
  /** Option to check forms. */
  public checkForms: boolean = true;
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
      title: "Method/Form Length",
      shortDescription: `Checks relating to method/form length.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#keep-methods-small

Abstract methods without statements are considered okay.`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
    };
  }

  private getDescription(issueType: IssueType, actual: string, type: string): string {
    switch (issueType) {
      case IssueType.EmptyMethod: {
        return "Empty " + type;
      }
      case IssueType.MaxStatements: {
        return "Reduce " + type + " length to max " + this.conf.statements + " statements, currently " + actual;
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
    const methodStats = MethodLengthStats.run(obj);
    const methodIssues = this.check(methodStats, "METHOD");

    let formIssues: Issue[] = [];
    if (this.conf.checkForms) {
      const formStats = FormLengthStats.run(obj);
      formIssues = this.check(formStats, "FORM");
    }

    return methodIssues.concat(formIssues);
  }

// ***********************

  private check(stats: IMethodLengthResult[], type: string) {
    const issues: Issue[] = [];

    for (const s of stats) {
      if ((this.conf.ignoreTestClasses === true)
        && s.file.getFilename().includes(".testclasses.")) {
        continue;
      }
      if (s.count === 0 && this.conf.errorWhenEmpty === true) {
        if (this.isAbstract(s)) {
          continue;
        }
        const issue = Issue.atPosition(s.file, s.pos, this.getDescription(IssueType.EmptyMethod, "0", type), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
        continue;
      }
      if (s.count > this.conf.statements) {
        const message = this.getDescription(IssueType.MaxStatements, s.count.toString(), type);
        const issue = Issue.atPosition(s.file, s.pos, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

  private isAbstract(result: IMethodLengthResult): boolean {
    const cdef = result.file.getInfo().getClassDefinitionByName(result.className);
    return cdef?.isAbstract === true;
  }

}