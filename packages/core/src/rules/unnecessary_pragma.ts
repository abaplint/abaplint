import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
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
      extendedInformation: `* NO_HANDLER with handler

* NEEDED without definition

* NO_TEXT without texts`,
      tags: [RuleTag.SingleFile],
      badExample: `TRY.
    ...
  CATCH zcx_abapgit_exception ##NO_HANDLER.
    RETURN. " it has a handler
ENDTRY.
MESSAGE w125(zbar) WITH c_foo INTO message ##NEEDED ##NO_TEXT.`,
      goodExample: `TRY.
    ...
  CATCH zcx_abapgit_exception.
    RETURN.
ENDTRY.
MESSAGE w125(zbar) WITH c_foo INTO message.`,
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

      issues.push(...this.checkText(statement, file));
      issues.push(...this.checkNeeded(statement, file));
    }

    return issues;
  }

  private checkText(statement: StatementNode, file: ABAPFile): Issue[] {
    const p = statement.getPragmas().find(t => t.getStr().toUpperCase() === "##NO_TEXT");
    if (p === undefined) {
      return [];
    }

    if (statement.findFirstExpression(Expressions.ConstantString) === undefined
        && statement.findFirstExpression(Expressions.StringTemplate) === undefined) {
      const message = "There is no text, NO_TEXT can be removed";
      return [Issue.atToken(file, p, message, this.getMetadata().key, this.getConfig().severity)];
    }

    return [];
  }

  private checkNeeded(statement: StatementNode, file: ABAPFile): Issue[] {
    const p = statement.getPragmas().find(t => t.getStr().toUpperCase() === "##NEEDED");
    if (p === undefined) {
      return [];
    }

    if (statement.findFirstExpression(Expressions.InlineData) === undefined
        && !(statement.get() instanceof Statements.Parameter)
        && !(statement.get() instanceof Statements.Data)
        && !(statement.get() instanceof Statements.DataEnd)
        && !(statement.get() instanceof Statements.Type)
        && !(statement.get() instanceof Statements.TypeEnd)
        && !(statement.get() instanceof Statements.Constant)
        && !(statement.get() instanceof Statements.ConstantEnd)
        && !(statement.get() instanceof Statements.TypeEnum)
        && !(statement.get() instanceof Statements.TypeEnumEnd)
        && !(statement.get() instanceof Statements.MethodImplementation)
        && !(statement.get() instanceof Statements.MethodDef)
        && statement.findFirstExpression(Expressions.InlineFS) === undefined) {
      const message = "There is no data definition, NEEDED can be removed";
      return [Issue.atToken(file, p, message, this.getMetadata().key, this.getConfig().severity)];
    }

    return [];
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