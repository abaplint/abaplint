import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {StatementNode} from "../abap/nodes";
import {Comment} from "../abap/2_statements/statements/_statement";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class UnnecessaryPragmaConf extends BasicRuleConfig {
}

export class UnnecessaryPragma extends ABAPRule {
  private conf = new UnnecessaryPragmaConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unnecessary_pragma",
      title: "Unnecessary Pragma",
      shortDescription: `Finds pragmas which can be removed`,
      extendedInformation: `* Checks NO_HANDLER pragmas that can be removed`,
      tags: [RuleTag.SingleFile],
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

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnnecessaryPragmaConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    let noHandler: boolean = false;

    const statements = file.getStatements();
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.get() instanceof Statements.EndTry) {
        noHandler = false;
      } else if (statement.get() instanceof Comment) {
        continue;
      } else if (noHandler === true && !(statement.get() instanceof Statements.Catch)) {
        const message = "NO_HANDLER pragma or pseudo comment can be removed";
        const issue = Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
        noHandler = false;
      } else {
        noHandler = this.containsNoHandler(statement, statements[i + 1]);
      }
    }

    return issues;
  }

  private containsNoHandler(statement: StatementNode, next: StatementNode | undefined): boolean {
    for (const t of statement.getPragmas()) {
      if (t.getStr().toUpperCase() === "##NO_HANDLER") {
        return true;
      }
    }
    if (next
        && next.get() instanceof Comment
        && next.concatTokens().toUpperCase().includes("#EC NO_HANDLER")) {
      return true;
    }
    return false;
  }

}