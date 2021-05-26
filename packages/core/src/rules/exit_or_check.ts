import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {StatementNode} from "../abap/nodes";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class ExitOrCheckConf extends BasicRuleConfig {
  public allowExit: boolean = true;
  public allowCheck: boolean = true;
}

export class ExitOrCheck extends ABAPRule {

  private conf = new ExitOrCheckConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "exit_or_check",
      title: "Find EXIT or CHECK outside loops",
      shortDescription: `Detects usages of EXIT or CHECK statements outside of loops.
Use RETURN to leave procesing blocks instead.`,
      extendedInformation: `
https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abenleave_processing_blocks.htm
https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/abapcheck_processing_blocks.htm
https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#check-vs-return
`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ExitOrCheckConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stack: StatementNode[] = [];

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Loop
          || statement.get() instanceof Statements.While
          || statement.get() instanceof Statements.SelectLoop
          || statement.get() instanceof Statements.Do) {
        stack.push(statement);
      } else if (statement.get() instanceof Statements.EndLoop
          || statement.get() instanceof Statements.EndWhile
          || statement.get() instanceof Statements.EndSelect
          || statement.get() instanceof Statements.EndDo) {
        stack.pop();
      } else if (this.conf.allowCheck === true && statement.get() instanceof Statements.Check && stack.length === 0) {
        const message = "CHECK is not allowed outside of loops";
        const issue = Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      } else if (this.conf.allowExit === true && statement.get() instanceof Statements.Exit && stack.length === 0) {
        const message = "EXIT is not allowed outside of loops";
        const issue = Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

}