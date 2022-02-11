import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Dynamic, ParameterListExceptions, Target} from "../abap/2_statements/expressions";
import {Version} from "../version";
import {IRuleMetadata, RuleTag} from "./_irule";
import {EditHelper, IEdit} from "../edit_helper";
import {StatementNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";

export class UseNewConf extends BasicRuleConfig {
}

export class UseNew extends ABAPRule {
  private conf = new UseNewConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "use_new",
      title: "Use NEW",
      shortDescription: `Checks for deprecated CREATE OBJECT statements.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-new-to-create-object

If the target variable is referenced in the CREATE OBJECT statement, no errors are issued

Applicable from v740sp02 and up`,
      badExample: `CREATE OBJECT ref.`,
      goodExample: `ref = NEW #( ).`,
      tags: [RuleTag.Upport, RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.SingleFile],
    };
  }

  private getMessage(): string {
    return "Use NEW #( ) to instantiate object.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UseNewConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];

    if (obj.getType() === "INTF") {
      return [];
    }

    if (this.reg.getConfig().getVersion() < Version.v740sp02 && this.reg.getConfig().getVersion() !== Version.Cloud) {
      return [];
    }

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.CreateObject) {
        if (statement.findFirstExpression(Dynamic)) {
          continue;
        } else if (statement.findDirectExpression(ParameterListExceptions)) {
          continue;
        }
        const target = statement.findDirectExpression(Target)?.concatTokens() + "->";
        if (statement.concatTokens().includes(target)) {
          continue;
        }

        const fix = this.buildFix(file, statement);
        const issue = Issue.atPosition(file, statement.getStart(), this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
        issues.push(issue);
      }
    }

    return issues;
  }

  private buildFix(file: ABAPFile, statement: StatementNode): IEdit | undefined {
    const target = statement.findDirectExpression(Expressions.Target)?.concatTokens();
    if (target === undefined) {
      return undefined;
    }
    const parameters = statement.findDirectExpression(Expressions.ParameterListS);
    const param = parameters ? parameters.concatTokens() + " " : "";

    let type = statement.findDirectExpression(Expressions.ClassName)?.getFirstToken().getStr();
    if (type === undefined) {
      type = "#";
    }

    const string = `${target} = NEW ${type}( ${param}).`;

    return EditHelper.replaceRange(file, statement.getStart(), statement.getEnd(), string);
  }
}