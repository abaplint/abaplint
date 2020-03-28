import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {StatementNode} from "../abap/nodes";
import {Comment} from "../abap/2_statements/statements/_statement";

/** Checks NO_HANDLER pragmas that can be removed */
export class CheckNoHandlerPragmaConf extends BasicRuleConfig {
}

export class CheckNoHandlerPragma extends ABAPRule {
  private conf = new CheckNoHandlerPragmaConf();

  public getKey(): string {
    return "check_no_handler_pragma";
  }

  private getDescription(): string {
    return "NO_HANDLER pragma can be removed";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckNoHandlerPragmaConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    let noHandler: boolean = false;

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.EndTry) {
        noHandler = false;
      } else if (statement.get() instanceof Comment) {
        continue;
      } else if (noHandler === true && !(statement.get() instanceof Statements.Catch)) {
        const issue = Issue.atStatement(file, statement, this.getDescription(), this.getKey());
        issues.push(issue);
        noHandler = false;
      } else {
        noHandler = this.containsNoHandler(statement);
      }
    }

    return issues;
  }

  private containsNoHandler(statement: StatementNode): boolean {
    for (const t of statement.getPragmas()) {
      if (t.getStr().toUpperCase() === "##NO_HANDLER") {
        return true;
      }
    }
    return false;
  }

}