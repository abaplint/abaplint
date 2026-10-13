import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes/statement_node";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";
import {Severity} from "../severity";

export class IsAssignedInLoopConf extends BasicRuleConfig {
  public severity?: Severity = Severity.Warning;
}

export class IsAssignedInLoop extends ABAPRule {
  private conf = new IsAssignedInLoopConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "is_assigned_in_loop",
      title: "IS ASSIGNED after READ TABLE or ASSIGN in a loop",
      shortDescription: `Reports IS [NOT] ASSIGNED after a READ TABLE ... ASSIGNING or ASSIGN inside a loop, without UNASSIGN before it`,
      extendedInformation: `A failed READ TABLE ... ASSIGNING or ASSIGN keeps the previous binding of the field symbol. Inside a
loop, the field symbol still points to the row of an earlier iteration, so IS ASSIGNED is true
although the statement failed, and the code goes on with the wrong row.

Add UNASSIGN <fs> before the statement, inside the loop, or check sy-subrc after a READ TABLE.
The quick fix inserts the UNASSIGN; it is not offered for a field symbol declared inline in
the statement, or for a chained statement.

Not reported: a check that also reads sy-subrc, an ASSIGN that cannot fail (a static source
without dereference, table expression or dynamic part), and loops outside of the
method, form or function module of the statement. See also subrc_after_assign.`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `LOOP AT lt_cells INTO ls_cell.
  READ TABLE lt_styles ASSIGNING <style> WITH KEY id = ls_cell-style.
  IF <style> IS ASSIGNED.
    ls_cell-format = <style>-format.
  ENDIF.
ENDLOOP.`,
      goodExample: `LOOP AT lt_cells INTO ls_cell.
  UNASSIGN <style>.
  READ TABLE lt_styles ASSIGNING <style> WITH KEY id = ls_cell-style.
  IF <style> IS ASSIGNED.
    ls_cell-format = <style>-format.
  ENDIF.
ENDLOOP.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IsAssignedInLoopConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const name = this.boundByFailable(statement);
      if (name === undefined) {
        continue;
      }
      const fs = name.toUpperCase();

      const loop = this.innermostLoop(i, statements);
      if (loop === undefined || this.unassignedBefore(loop, i, statements, fs) === true) {
        continue;
      }

      const check = this.nextCheck(i, statements, fs);
      if (check === undefined) {
        continue;
      }

      const read = statement.get() instanceof Statements.ReadTable;
      const message = `${read ? "READ TABLE" : "ASSIGN"} in a loop keeps the previous binding of ${name} when it fails, `
        + `UNASSIGN ${name} before it` + (read ? " or check sy-subrc" : "");
      const fix = this.buildFix(file, statement, name);
      issues.push(Issue.atStatement(file, check, message, this.getMetadata().key, this.conf.severity, fix));
    }

    return issues;
  }

////////////////

  /** the field symbol bound by a READ TABLE ... ASSIGNING or an ASSIGN that can fail */
  private boundByFailable(statement: StatementNode): string | undefined {
    const s = statement.get();
    if (s instanceof Statements.ReadTable) {
      const target = statement.findDirectExpression(Expressions.ReadTableTarget)?.findDirectExpression(Expressions.FSTarget);
      return target?.findFirstExpression(Expressions.FieldSymbol)?.concatTokens();
    } else if (s instanceof Statements.Assign) {
      const source = statement.findDirectExpression(Expressions.AssignSource);
      if (source === undefined) {
        return undefined;
      }
      const first = source.getFirstToken().getStr().toUpperCase();
      const failable = first === "COMPONENT"
        || first === "TABLE"
        || source.findFirstExpression(Expressions.Dynamic) !== undefined
        || source.findFirstExpression(Expressions.Dereference) !== undefined
        || source.findFirstExpression(Expressions.TableExpression) !== undefined
        || statement.findDirectTokenByText("INCREMENT") !== undefined;
      if (failable === false) {
        return undefined;
      }
      const target = statement.findDirectExpression(Expressions.FSTarget);
      return target?.findFirstExpression(Expressions.FieldSymbol)?.concatTokens();
    }
    return undefined;
  }

  /** index of the innermost LOOP, DO, WHILE or SELECT loop around the statement, in the same block */
  private innermostLoop(index: number, statements: readonly StatementNode[]): number | undefined {
    let depth = 0;
    for (let i = index - 1; i >= 0 && this.startsBlock(statements[i]) === false; i--) {
      if (this.endsLoop(statements[i])) {
        depth++;
      } else if (this.startsLoop(statements[i])) {
        if (depth === 0) {
          return i;
        }
        depth--;
      }
    }
    return undefined;
  }

  private unassignedBefore(loop: number, index: number, statements: readonly StatementNode[], fs: string): boolean {
    for (let i = loop + 1; i < index; i++) {
      if (statements[i].get() instanceof Statements.Unassign && this.mentions(statements[i], fs)) {
        return true;
      }
    }
    return false;
  }

  /** the first IS [NOT] ASSIGNED of the field symbol after the statement, before the end of the loop
   * or another UNASSIGN or binding of it; a check that also reads sy-subrc is fine */
  private nextCheck(index: number, statements: readonly StatementNode[], fs: string): StatementNode | undefined {
    let depth = 0;
    for (let i = index + 1; i < statements.length && this.startsBlock(statements[i]) === false; i++) {
      const statement = statements[i];
      if (this.startsLoop(statement)) {
        depth++;
      } else if (this.endsLoop(statement)) {
        if (depth === 0) {
          return undefined;
        }
        depth--;
      }
      const concat = statement.concatTokens().toUpperCase();
      if (concat.includes(fs + " IS ASSIGNED") || concat.includes(fs + " IS NOT ASSIGNED")) {
        return concat.includes("SY-SUBRC") ? undefined : statement;
      }
      if ((statement.get() instanceof Statements.Unassign && this.mentions(statement, fs))
          || this.binds(statement, fs)) {
        return undefined;
      }
    }
    return undefined;
  }

  private mentions(statement: StatementNode, fs: string): boolean {
    return statement.findAllExpressions(Expressions.FieldSymbol).some(e => e.concatTokens().toUpperCase() === fs);
  }

  private binds(statement: StatementNode, fs: string): boolean {
    return statement.findAllExpressions(Expressions.FSTarget)
      .some(t => t.findFirstExpression(Expressions.FieldSymbol)?.concatTokens().toUpperCase() === fs);
  }

  private startsLoop(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.Loop
      || s instanceof Statements.Do
      || s instanceof Statements.While
      || s instanceof Statements.SelectLoop;
  }

  private endsLoop(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.EndLoop
      || s instanceof Statements.EndDo
      || s instanceof Statements.EndWhile
      || s instanceof Statements.EndSelect;
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

  /** UNASSIGN on a line of its own before the statement, with the same indentation */
  private buildFix(file: ABAPFile, statement: StatementNode, name: string): IEdit | undefined {
    if (statement.getColon() !== undefined || statement.findFirstExpression(Expressions.InlineFS) !== undefined) {
      return undefined;
    }
    const start = statement.getStart();
    return EditHelper.insertAt(file, start, `UNASSIGN ${name}.\n` + " ".repeat(start.getCol() - 1));
  }

}
