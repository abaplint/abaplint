import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Dynamic, ParameterListExceptions} from "../abap/2_statements/expressions";
import {Version} from "../version";
import {IRuleMetadata, RuleTag} from "./_irule";
import {EditHelper, IEdit} from "../edit_helper";
import {StatementNode} from "../abap/nodes";

export class UseNewConf extends BasicRuleConfig {
}

export class UseNew extends ABAPRule {
  private conf = new UseNewConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "use_new",
      title: "Use NEW",
      shortDescription: `Checks for deprecated CREATE OBJECT statements.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-new-to-create-object`,
      badExample: `CREATE OBJECT ref.`,
      goodExample: `ref = NEW #( ).`,
      tags: [RuleTag.Upport, RuleTag.Styleguide, RuleTag.Quickfix],
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

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    if (this.reg.getConfig().getVersion() < Version.v740sp02) {
      return [];
    }

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.CreateObject) {
        if (statement.findFirstExpression(Dynamic)) {
          continue;
        } else if (statement.findDirectExpression(ParameterListExceptions)) {
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