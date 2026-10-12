import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes/statement_node";
import {Comment} from "../abap/2_statements/statements/_statement";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";
import {Severity} from "../severity";

export class SubrcAfterAssignConf extends BasicRuleConfig {
  public severity?: Severity = Severity.Warning;
}

export class SubrcAfterAssign extends ABAPRule {
  private conf = new SubrcAfterAssignConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "subrc_after_assign",
      title: "sy-subrc checked after ASSIGN",
      shortDescription: `Reports a sy-subrc check directly after an ASSIGN, use IS [NOT] ASSIGNED instead`,
      extendedInformation: `On a 7.40 SP7 system sy-subrc was still 4 after a successful ASSIGN, left over from an earlier
READ TABLE, see https://github.com/abap2UI5/abap2UI5/issues/1937. Current releases set sy-subrc here.
IS [NOT] ASSIGNED asks the field symbol directly and does not depend on the release.

A failed ASSIGN keeps the previous binding of the field symbol. So inside a loop, or when the
field symbol is bound earlier in the same method, IS ASSIGNED is true after a failed ASSIGN.
There, add UNASSIGN <fs> before the ASSIGN. The quick fix is only offered when the field symbol
is declared in the method, bound only by this ASSIGN, and the ASSIGN is not in a loop.

ASSIGN COMPONENT ... OF STRUCTURE is not reported.`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `ASSIGN (lv_name) TO <attri>.
IF sy-subrc = 0.
  WRITE <attri>.
ENDIF.`,
      goodExample: `ASSIGN (lv_name) TO <attri>.
IF <attri> IS ASSIGNED.
  WRITE <attri>.
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SubrcAfterAssignConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!(statement.get() instanceof Statements.Assign)
          || statement.findDirectExpression(Expressions.AssignSource)?.getFirstToken().getStr().toUpperCase() === "COMPONENT") {
        continue;
      }

      const target = statement.findDirectExpression(Expressions.FSTarget);
      const fs = target?.findFirstExpression(Expressions.FieldSymbol)?.concatTokens();
      if (target === undefined || fs === undefined) {
        continue;
      }

      const check = this.nextCheck(i, statements, fs.toUpperCase());
      if (check === undefined) {
        continue;
      }

      let message = `sy-subrc checked after ASSIGN, use ${fs} IS [NOT] ASSIGNED`;
      let fix: IEdit | undefined = undefined;
      if (this.insideLoop(i, statements) === true) {
        message += ` with UNASSIGN ${fs} before the ASSIGN, it is inside a loop`;
      } else if (this.boundEarlier(i, statements, fs.toUpperCase()) === true) {
        message += ` with UNASSIGN ${fs} before the ASSIGN, ${fs} is bound earlier`;
      } else if (target.findDirectExpression(Expressions.InlineFS) === undefined
          && this.declaredInBlock(i, statements, fs.toUpperCase()) === false) {
        message += ` with UNASSIGN ${fs} before the ASSIGN, ${fs} is not declared in this method`;
      } else {
        fix = this.buildFix(file, check, fs);
      }

      issues.push(Issue.atStatement(file, check, message, this.getMetadata().key, this.conf.severity, fix));
    }

    return issues;
  }

////////////////

  /** the next statement, skipping comments and ENDIF like check_subrc does, if it reads sy-subrc */
  private nextCheck(index: number, statements: readonly StatementNode[], fs: string): StatementNode | undefined {
    for (let i = index + 1; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.get() instanceof Comment
          || statement.get() instanceof Statements.EndIf
          || statement.get() instanceof Statements.EndTestSeam) {
        continue;
      }
      const concat = statement.concatTokens().toUpperCase();
      if (concat.includes(fs + " IS ASSIGNED") || concat.includes(fs + " IS NOT ASSIGNED")) {
        return undefined;
      }
      return concat.includes("SY-SUBRC") ? statement : undefined;
    }
    return undefined;
  }

  private insideLoop(index: number, statements: readonly StatementNode[]): boolean {
    let depth = 0;
    for (let i = index - 1; i >= 0 && this.startsBlock(statements[i]) === false; i--) {
      const s = statements[i].get();
      if (s instanceof Statements.EndLoop || s instanceof Statements.EndDo || s instanceof Statements.EndWhile) {
        depth++;
      } else if (s instanceof Statements.Loop || s instanceof Statements.Do || s instanceof Statements.While) {
        if (depth === 0) {
          return true;
        }
        depth--;
      }
    }
    return false;
  }

  /** any earlier statement in the block with the field symbol as target, eg. ASSIGN, LOOP or READ TABLE ASSIGNING */
  private boundEarlier(index: number, statements: readonly StatementNode[], fs: string): boolean {
    for (let i = index - 1; i >= 0 && this.startsBlock(statements[i]) === false; i--) {
      for (const target of statements[i].findAllExpressions(Expressions.FSTarget)) {
        if (target.findFirstExpression(Expressions.FieldSymbol)?.concatTokens().toUpperCase() === fs) {
          return true;
        }
      }
    }
    return false;
  }

  private declaredInBlock(index: number, statements: readonly StatementNode[], fs: string): boolean {
    for (let i = index - 1; i >= 0 && this.startsBlock(statements[i]) === false; i--) {
      if (statements[i].get() instanceof Statements.FieldSymbol
          && statements[i].findDirectExpression(Expressions.FieldSymbol)?.concatTokens().toUpperCase() === fs) {
        return true;
      }
    }
    return false;
  }

  private startsBlock(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.MethodImplementation
      || s instanceof Statements.Form
      || s instanceof Statements.FunctionModule
      || s instanceof Statements.Module
      || s instanceof Statements.EndMethod
      || s instanceof Statements.EndForm
      || s instanceof Statements.EndFunction
      || s instanceof Statements.EndModule;
  }

  /** replaces "sy-subrc = 0" or "sy-subrc <> 0" in place, also inside a longer condition */
  private buildFix(file: ABAPFile, statement: StatementNode, fs: string): IEdit | undefined {
    const tokens = statement.getTokens();
    for (let i = 0; i + 4 < tokens.length; i++) {
      if (tokens[i].getStr().toUpperCase() !== "SY"
          || tokens[i + 1].getStr() !== "-"
          || tokens[i + 2].getStr().toUpperCase() !== "SUBRC") {
        continue;
      }
      if (tokens[i + 4].getStr() !== "0") {
        return undefined;
      }
      const op = tokens[i + 3].getStr().toUpperCase();
      if (op === "=" || op === "EQ") {
        return EditHelper.replaceRange(file, tokens[i].getStart(), tokens[i + 4].getEnd(), `${fs} IS ASSIGNED`);
      } else if (op === "<>" || op === "NE") {
        return EditHelper.replaceRange(file, tokens[i].getStart(), tokens[i + 4].getEnd(), `${fs} IS NOT ASSIGNED`);
      }
      return undefined;
    }
    return undefined;
  }

}
