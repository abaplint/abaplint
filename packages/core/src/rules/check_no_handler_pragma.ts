import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {StatementNode} from "../abap/nodes";
import {Comment} from "../abap/2_statements/statements/_statement";
import {IRuleMetadata} from "./_irule";

export class CheckNoHandlerPragmaConf extends BasicRuleConfig {
}

export class CheckNoHandlerPragma extends ABAPRule {
  private conf = new CheckNoHandlerPragmaConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "check_no_handler_pragma",
      title: "Check if NO_HANDLER can be removed",
      quickfix: false,
      shortDescription: `Checks NO_HANDLER pragmas that can be removed`,
      badExample: `TRY.
    ...
  CATCH zcx_abapgit_exception ##NO_HANDLER.
    RETURN. " it has a handler
ENDTRY.`,
      goodExample: `TRY.
    ...
  CATCH zcx_abapgit_exception.
    RETURN.
ENDTRY.`,
    };
  }

  private getMessage(): string {
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
        const issue = Issue.atStatement(file, statement, this.getMessage(), this.getMetadata().key);
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