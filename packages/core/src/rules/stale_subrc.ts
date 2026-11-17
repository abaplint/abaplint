import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes/statement_node";
import {Comment} from "../abap/2_statements/statements/_statement";
import {ABAPFile} from "../abap/abap_file";
import {Severity} from "../severity";
import {BuiltIn} from "../abap/5_syntax/_builtin";

export class StaleSubrcConf extends BasicRuleConfig {
  public severity?: Severity = Severity.Warning;
}

export class StaleSubrc extends ABAPRule {
  private conf = new StaleSubrcConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "stale_subrc",
      title: "sy-subrc checked after a method call",
      shortDescription: `Reports IF, CHECK, ASSERT or CASE on sy-subrc directly after a method call without EXCEPTIONS`,
      extendedInformation: `A method call without EXCEPTIONS does not set sy-subrc. After the call, sy-subrc holds whatever
the last statement inside the method set, so the check depends on the method's implementation
and breaks silently when the method changes.

Check the result of the method instead, eg. a returning parameter or an exception, or move the
check directly after the statement that sets sy-subrc.

Reported: the statement directly before the check is a method call, CALL METHOD, or an
assignment with a method call or NEW in its source.

Not reported: a call with EXCEPTIONS or EXCEPTION-TABLE, an assignment that only calls built-in
functions like lines( ), and any other statement before the check, eg. CALL FUNCTION or
CREATE OBJECT, a check that is the first statement of a block, or a check after ENDIF.
An assignment or CLEAR without a call does not change sy-subrc, so a check after it still
reads the statement before it, which is not reported either.
See also check_subrc and subrc_after_assign.`,
      tags: [RuleTag.SingleFile],
      badExample: `lv_parent = read_parent( ).
IF sy-subrc = 0.
  WRITE lv_parent.
ENDIF.`,
      goodExample: `lv_parent = read_parent( ).
IF lv_parent IS NOT INITIAL.
  WRITE lv_parent.
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: StaleSubrcConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (this.isSubrcCheck(statement) === false) {
        continue;
      }

      const previous = this.previousStatement(i, statements);
      if (previous === undefined || this.isCallWithoutExceptions(previous) === false) {
        continue;
      }

      const message = "sy-subrc checked after a method call without EXCEPTIONS, the call does not set sy-subrc";
      issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
    }

    return issues;
  }

////////////////

  private isSubrcCheck(statement: StatementNode): boolean {
    const s = statement.get();
    if (!(s instanceof Statements.If
        || s instanceof Statements.Check
        || s instanceof Statements.Assert
        || s instanceof Statements.Case)) {
      return false;
    }
    return this.readsSubrc(statement);
  }

  private readsSubrc(statement: StatementNode): boolean {
    for (const field of statement.findAllExpressions(Expressions.FieldChain)) {
      if (field.concatTokens().toUpperCase() === "SY-SUBRC") {
        return true;
      }
    }
    return false;
  }

  /** the statement directly before, skipping comments */
  private previousStatement(index: number, statements: readonly StatementNode[]): StatementNode | undefined {
    for (let i = index - 1; i >= 0; i--) {
      if (statements[i].get() instanceof Comment) {
        continue;
      }
      return statements[i];
    }
    return undefined;
  }

  /** a standalone method call, or an assignment with a method call or NEW in its source */
  private isCallWithoutExceptions(statement: StatementNode): boolean {
    const s = statement.get();
    if (s instanceof Statements.Call) {
      return this.hasClassicExceptions(statement) === false;
    } else if (!(s instanceof Statements.Move) || this.hasClassicExceptions(statement) === true) {
      return false;
    }

    if (statement.findFirstExpression(Expressions.NewObject) !== undefined) {
      return true;
    }
    const tokens = statement.getTokens();
    for (const call of statement.findAllExpressions(Expressions.MethodCall)) {
      const name = call.getFirstToken();
      const index = tokens.indexOf(name);
      const before = index > 0 ? tokens[index - 1].getStr() : "";
      if (before === "->" || before === "=>" || BuiltIn.methods[name.getStr().toUpperCase()] === undefined) {
        return true;
      }
    }
    return false;
  }

  private hasClassicExceptions(statement: StatementNode): boolean {
    for (const token of statement.getTokens()) {
      const str = token.getStr().toUpperCase();
      if (str === "EXCEPTIONS" || str === "EXCEPTION-TABLE") {
        return true;
      }
    }
    return false;
  }

}
