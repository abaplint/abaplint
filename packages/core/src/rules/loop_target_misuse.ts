import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes/statement_node";
import {ExpressionNode} from "../abap/nodes/expression_node";
import {ABAPFile} from "../abap/abap_file";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {MacroCall, Unknown} from "../abap/2_statements/statements/_statement";

export class LoopTargetMisuseConf extends BasicRuleConfig {
  /** Report a LOOP inside a LOOP with the same target, when the outer loop body uses the target after the inner ENDLOOP */
  public nestedLoop: boolean = true;
  /** Report LOOP AT ... INTO <fs> and READ TABLE ... INTO <fs> when the local field symbol is only bound by ASSIGNING,
   * so the statement overwrites a table row */
  public intoFieldSymbol: boolean = true;
  /** Report a field symbol of LOOP AT ... ASSIGNING used after ENDLOOP, and a field symbol of READ TABLE ... ASSIGNING
   * used after the check of sy-subrc, outside the branch that found the row */
  public usedAfterLoop: boolean = true;
}

/** a control block opened after the LOOP or READ TABLE, while looking for a use of its field symbol */
interface IScanFrame {
  /** the condition of the block checks sy-subrc, the table or a variable set in the loop */
  guard: boolean;
  /** the block uses the field symbol */
  uses: boolean;
  /** the block contains a statement that leaves it, like RETURN, EXIT or RAISE */
  leaves: boolean;
}

export class LoopTargetMisuse extends ABAPRule {
  private conf = new LoopTargetMisuseConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "loop_target_misuse",
      title: "LOOP and READ TABLE targets used wrongly",
      shortDescription: `Reports a nested LOOP that reuses the target of the enclosing LOOP, and INTO <fs> where ASSIGNING was meant`,
      extendedInformation: `Option nestedLoop: a LOOP inside a LOOP with the same INTO, REFERENCE INTO or ASSIGNING target.
After the inner ENDLOOP, the target holds the last row of the inner table, not the row of the
outer loop. Reported when the outer loop body uses the target after the inner ENDLOOP, before
it is assigned again.
Not reported: a target of a loop that has already ended, a target that is not a plain variable
or field symbol, an enclosing LOOP with GROUP BY, and a target the outer loop body does not use
after the inner loop.

Option intoFieldSymbol: LOOP AT ... INTO <fs> or READ TABLE ... INTO <fs>. INTO copies the row
into the data object the field symbol points to. When <fs> was bound by ASSIGNING, that data
object is a row of a table, and the statement overwrites it. ASSIGNING was meant.
Reported only for a field symbol declared in the method, form or function module, and only when
no ASSIGN and no STRUCTURE ... DEFAULT binds it there, so it can only point to a table row.

Option usedAfterLoop: a field symbol of LOOP AT ... ASSIGNING used after ENDLOOP. It points to
the last row the loop processed. When the loop processed no row, it is not assigned, and the use
raises GETWA_NOT_ASSIGNED, or it still points to what it was bound to before the loop.
Also a field symbol of READ TABLE ... ASSIGNING used after sy-subrc was checked, outside the
branch of that check. When the READ fails, the field symbol keeps its previous binding.
Reported at the first such use in the method, form or function module.
Not reported: a use inside IF, ELSEIF, CASE or WHILE whose condition reads sy-subrc, the table of
the loop or a variable the loop body sets (a flag), a use after such a check that leaves with
RETURN, EXIT, CONTINUE, CHECK, RAISE or MESSAGE or that does not use the field symbol, a use after
CHECK or ASSERT of such a condition, and any use after IS ASSIGNED, UNASSIGN or another binding of
the field symbol, or after a macro call. Work areas of INTO are not checked, they keep a value.
A READ TABLE whose sy-subrc is not checked at all is left to check_subrc, a LOOP inside a LOOP
with the same field symbol to the option nestedLoop.`,
      tags: [RuleTag.SingleFile],
      badExample: `LOOP AT lt_header INTO ls_row.
  LOOP AT lt_items INTO ls_row WHERE parent = ls_row-id.
    lv_sum = lv_sum + ls_row-amount.
  ENDLOOP.
  ls_row-amount = lv_sum.
  APPEND ls_row TO lt_result.
ENDLOOP.

LOOP AT lt_a ASSIGNING <ls_a>.
ENDLOOP.
READ TABLE lt_a INTO <ls_a> INDEX 1.

LOOP AT lt_a ASSIGNING <ls_a> WHERE id = lv_id.
  EXIT.
ENDLOOP.
<ls_a>-flag = abap_true.`,
      goodExample: `LOOP AT lt_header INTO ls_row.
  LOOP AT lt_items INTO ls_item WHERE parent = ls_row-id.
    lv_sum = lv_sum + ls_item-amount.
  ENDLOOP.
  ls_row-amount = lv_sum.
  APPEND ls_row TO lt_result.
ENDLOOP.

LOOP AT lt_a ASSIGNING <ls_a>.
ENDLOOP.
READ TABLE lt_a ASSIGNING <ls_a> INDEX 1.

LOOP AT lt_a ASSIGNING <ls_a> WHERE id = lv_id.
  EXIT.
ENDLOOP.
IF sy-subrc = 0.
  <ls_a>-flag = abap_true.
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LoopTargetMisuseConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();

    if (this.conf.nestedLoop !== false) {
      issues.push(...this.checkNestedLoop(file, statements));
    }
    if (this.conf.intoFieldSymbol !== false) {
      issues.push(...this.checkIntoFieldSymbol(file, statements));
    }
    if (this.conf.usedAfterLoop !== false) {
      for (const issue of this.checkUsedAfterLoop(file, statements)) {
        // a READ TABLE ... INTO <fs> after the loop is already reported by the option intoFieldSymbol
        if (issues.some(i => i.getStart().equals(issue.getStart())) === false) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

////////////////

  private checkNestedLoop(file: ABAPFile, statements: readonly StatementNode[]): Issue[] {
    const issues: Issue[] = [];
    // one entry per open LOOP, key undefined when the LOOP has no target to compare
    let open: {index: number, key: string | undefined}[] = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const s = statement.get();
      if (this.isBlockBoundary(statement)) {
        open = [];
      } else if (s instanceof Statements.EndLoop) {
        open.pop();
      } else if (s instanceof Statements.Loop) {
        const node = this.loopTarget(statement);
        const target = node ? this.targetName(node) : undefined;
        // INTO <fs> inside LOOP ... ASSIGNING <fs> is left to the option intoFieldSymbol
        const key = target === undefined ? undefined : (node?.get() instanceof Expressions.Target ? "INTO " : "ASSIGNING ") + target;
        const outer = key === undefined ? undefined : [...open].reverse().find(o => o.key === key);
        if (node !== undefined && target !== undefined && outer !== undefined) {
          const innerEnd = this.findEndLoop(statements, i);
          const outerEnd = this.findEndLoop(statements, outer.index);
          if (innerEnd !== undefined && outerEnd !== undefined && this.usedBetween(statements, innerEnd + 1, outerEnd, target)) {
            const name = node.concatTokens();
            const message = `Inner LOOP reuses ${name}, the target of the enclosing LOOP, `
              + `which is used after the inner ENDLOOP and then holds a row of the inner table`;
            issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
          }
        }
        const grouped = statement.findDirectExpression(Expressions.LoopGroupBy) !== undefined;
        open.push({index: i, key: grouped ? undefined : key});
      }
    }

    return issues;
  }

  /** the Target or FSTarget after INTO, REFERENCE INTO or ASSIGNING of a LOOP */
  private loopTarget(statement: StatementNode): ExpressionNode | undefined {
    const target = statement.findDirectExpression(Expressions.LoopTarget);
    return target?.findDirectExpression(Expressions.Target) || target?.findDirectExpression(Expressions.FSTarget);
  }

  /** upper case name of a Target or FSTarget that is a plain variable or field symbol, also declared inline */
  private targetName(node: ExpressionNode): string | undefined {
    const inline = node.findDirectExpression(Expressions.InlineData)?.findDirectExpression(Expressions.TargetField)
      || node.findDirectExpression(Expressions.InlineFS)?.findDirectExpression(Expressions.TargetFieldSymbol);
    const tokens = (inline || node).getAllTokens();
    return tokens.length === 1 ? tokens[0].getStr().toUpperCase() : undefined;
  }

  /** index of the ENDLOOP that closes the LOOP at the index */
  private findEndLoop(statements: readonly StatementNode[], index: number): number | undefined {
    let depth = 0;
    for (let i = index + 1; i < statements.length && this.isBlockBoundary(statements[i]) === false; i++) {
      const s = statements[i].get();
      if (s instanceof Statements.Loop || s instanceof Statements.LoopAtScreen || s instanceof Statements.LoopExtract) {
        depth++;
      } else if (s instanceof Statements.EndLoop) {
        if (depth === 0) {
          return i;
        }
        depth--;
      }
    }
    return undefined;
  }

  /** true when a statement in [from, to) uses the variable before a statement assigns all of it */
  private usedBetween(statements: readonly StatementNode[], from: number, to: number, name: string): boolean {
    for (let i = from; i < to; i++) {
      const statement = statements[i];
      const s = statement.get();
      if (s instanceof Statements.Data || s instanceof Statements.FieldSymbol) {
        continue;
      }
      const whole = new Set<AbstractToken>();
      for (const t of [...statement.findAllExpressions(Expressions.Target), ...statement.findAllExpressions(Expressions.FSTarget)]) {
        if (this.targetName(t) === name) {
          t.getAllTokens().forEach(token => whole.add(token));
        }
      }
      const tokens = statement.getTokens();
      for (let j = 0; j < tokens.length; j++) {
        const previous = j > 0 ? tokens[j - 1].getStr() : "";
        if (tokens[j].getStr().toUpperCase() === name
            && whole.has(tokens[j]) === false
            && ["-", "->", "=>", "~"].includes(previous) === false) {
          return s instanceof Statements.Unassign ? false : true;
        }
      }
      if (whole.size > 0) {
        return false;
      }
    }
    return false;
  }

  private checkIntoFieldSymbol(file: ABAPFile, statements: readonly StatementNode[]): Issue[] {
    const issues: Issue[] = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const s = statement.get();
      if (!(s instanceof Statements.Loop) && !(s instanceof Statements.ReadTable)) {
        continue;
      }
      const target = statement.findDirectExpression(Expressions.LoopTarget)
        || statement.findDirectExpression(Expressions.ReadTableTarget);
      const into = target?.findDirectExpression(Expressions.Target);
      const fs = into?.findDirectExpression(Expressions.TargetFieldSymbol);
      if (into === undefined || fs === undefined || fs.concatTokens() !== into.concatTokens()) {
        continue;
      }
      const name = fs.concatTokens().toUpperCase();
      if (this.onlyBoundToRows(statements, i, name) === false) {
        continue;
      }
      const what = s instanceof Statements.Loop ? "LOOP AT" : "READ TABLE";
      const message = `${what} ... INTO ${fs.concatTokens()} overwrites the row the field symbol points to, use ASSIGNING`;
      issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
    }

    return issues;
  }

  /** true when the field symbol is declared in the block around the statement and every binding of it
   * in that block is an ASSIGNING, so it can only point to a table row */
  private onlyBoundToRows(statements: readonly StatementNode[], index: number, name: string): boolean {
    let start = index;
    while (start > 0 && this.isBlockBoundary(statements[start]) === false) {
      start--;
    }
    if (this.startsBlock(statements[start]) === false) {
      return false;
    }

    let declared = false;
    let assigning = false;
    for (let i = start + 1; i < statements.length && this.endsBlock(statements[i]) === false; i++) {
      const statement = statements[i];
      if (statement.get() instanceof Statements.FieldSymbol) {
        if (statement.findDirectExpression(Expressions.FieldSymbol)?.concatTokens().toUpperCase() === name) {
          if (statement.findDirectTokenByText("DEFAULT") !== undefined) {
            return false;
          }
          declared = true;
        }
        continue;
      }
      for (const fsTarget of statement.findAllExpressions(Expressions.FSTarget)) {
        if (this.fsName(fsTarget) !== name) {
          continue;
        }
        if (statement.get() instanceof Statements.Assign) {
          return false;
        }
        assigning = true;
        if (fsTarget.findDirectExpression(Expressions.InlineFS) !== undefined) {
          declared = true;
        }
      }
    }

    return declared && assigning;
  }

  private fsName(fsTarget: ExpressionNode): string | undefined {
    return fsTarget.findFirstExpression(Expressions.FieldSymbol)?.concatTokens().toUpperCase();
  }

  private checkUsedAfterLoop(file: ABAPFile, statements: readonly StatementNode[]): Issue[] {
    const issues: Issue[] = [];
    // the field symbols of the open LOOPs, undefined for a LOOP without field symbol
    let open: (string | undefined)[] = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const s = statement.get();
      if (this.isBlockBoundary(statement)) {
        open = [];
        continue;
      } else if (s instanceof Statements.EndLoop) {
        open.pop();
        continue;
      }

      let use: number | undefined = undefined;
      let name: string | undefined = undefined;
      let what = "";
      if (s instanceof Statements.Loop) {
        const node = this.loopTarget(statement);
        name = node?.get() instanceof Expressions.FSTarget ? this.targetName(node) : undefined;
        const end = this.findEndLoop(statements, i);
        // a LOOP inside a LOOP with the same field symbol is left to the option nestedLoop
        if (name !== undefined && end !== undefined && open.includes(name) === false) {
          const guards = this.loopGuards(statements, i, end, name);
          use = this.findUncheckedUse(statements, end + 1, name, guards, false);
          what = `after ENDLOOP, it points to the last row, or is not assigned when the loop processed no row`;
        }
        open.push(name);
      } else if (s instanceof Statements.LoopAtScreen || s instanceof Statements.LoopExtract) {
        open.push(undefined);
      } else if (s instanceof Statements.ReadTable) {
        const fs = statement.findDirectExpression(Expressions.ReadTableTarget)?.findDirectExpression(Expressions.FSTarget);
        name = fs ? this.targetName(fs) : undefined;
        if (name !== undefined) {
          use = this.findUncheckedUse(statements, i + 1, name, new Set<string>(), true);
          what = `outside the check of sy-subrc, when the READ TABLE fails it is not assigned or points to an earlier row`;
        }
      }

      if (use !== undefined && name !== undefined) {
        const token = statements[use].getTokens().find(t => t.getStr().toUpperCase() === name);
        const message = `${token?.getStr()} is used ${what}`;
        issues.push(Issue.atStatement(file, statements[use], message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  /** upper case names of the variables whose check counts as a check that the LOOP processed a row:
   * the table and the variables the loop body writes */
  private loopGuards(statements: readonly StatementNode[], loop: number, end: number, name: string): Set<string> {
    const guards = new Set<string>();
    const first = statements[loop].findDirectExpression(Expressions.LoopSource)?.getFirstToken().getStr().toUpperCase();
    if (first !== undefined) {
      guards.add(first);
    }
    for (let i = loop + 1; i < end; i++) {
      for (const target of statements[i].findAllExpressions(Expressions.Target)) {
        guards.add(this.firstName(target));
      }
    }
    guards.delete(name);
    return guards;
  }

  /** upper case name of the variable a Target writes, also declared inline */
  private firstName(target: ExpressionNode): string {
    const inline = target.findFirstExpression(Expressions.TargetField);
    return (inline ? inline.getFirstToken() : target.getFirstToken()).getStr().toUpperCase();
  }

  /** index of the first statement from the index on that uses the field symbol without a check before it,
   * looking until the end of the method, form or function module or until the field symbol is bound again.
   * With checkFirst, only a use after a check is returned, an unchecked READ TABLE is left to check_subrc */
  private findUncheckedUse(statements: readonly StatementNode[], from: number, name: string,
                           guards: Set<string>, checkFirst: boolean): number | undefined {
    const frames: IScanFrame[] = [];
    let checked = false;
    let sawCheck = false;

    for (let i = from; i < statements.length && this.isBlockBoundary(statements[i]) === false; i++) {
      const statement = statements[i];
      const s = statement.get();
      if (s instanceof MacroCall || s instanceof Unknown || this.bindsOrTests(statement, name)) {
        return undefined;
      }

      const isCondition = s instanceof Statements.If || s instanceof Statements.ElseIf || s instanceof Statements.Case
        || s instanceof Statements.When || s instanceof Statements.While
        || s instanceof Statements.Check || s instanceof Statements.Assert;
      const guard = isCondition && this.isGuard(statement, guards);
      sawCheck = sawCheck || guard;
      if ((s instanceof Statements.Check || s instanceof Statements.Assert) && guard) {
        checked = true;
      }

      if (s instanceof Statements.FieldSymbol === false && this.mentions(statement, name)) {
        if (guard || checked || frames.some(f => f.guard)) {
          frames.forEach(f => f.uses = true);
        } else if (checkFirst === false || sawCheck === true) {
          return i;
        }
      }

      if (guard || frames.some(f => f.guard)) {
        // a flag set where the check holds, like lv_found = abap_true, checks it as well
        for (const target of statement.findAllExpressions(Expressions.Target)) {
          guards.add(this.firstName(target));
        }
        guards.delete(name);
      }

      if (this.leaves(statement)) {
        frames.forEach(f => f.leaves = true);
      }

      if (this.opensBlock(statement)) {
        frames.push({guard, uses: false, leaves: false});
      } else if (this.isBranch(statement)) {
        if (frames.length === 0) {
          // another branch of a block around the binding, it does not run after it
          return undefined;
        }
        frames[frames.length - 1].guard = frames[frames.length - 1].guard || guard;
      } else if (this.closesBlock(statement)) {
        const frame = frames.pop();
        // IF sy-subrc <> 0. RETURN. ENDIF., or a check that sets a flag
        if (frame && frame.guard && (frame.leaves || frame.uses === false)) {
          checked = true;
        }
      }
    }

    return undefined;
  }

  /** true when the statement binds the field symbol again, unassigns it, or checks IS ASSIGNED */
  private bindsOrTests(statement: StatementNode, name: string): boolean {
    if (statement.get() instanceof Statements.Unassign && this.mentions(statement, name)) {
      return true;
    }
    for (const fsTarget of statement.findAllExpressions(Expressions.FSTarget)) {
      if (this.targetName(fsTarget) === name) {
        return true;
      }
    }
    const tokens = statement.getTokens().map(t => t.getStr().toUpperCase());
    for (let i = 0; i < tokens.length - 2; i++) {
      if (tokens[i] === name && tokens[i + 1] === "IS"
          && (tokens[i + 2] === "ASSIGNED" || (tokens[i + 2] === "NOT" && tokens[i + 3] === "ASSIGNED"))) {
        return true;
      }
    }
    return false;
  }

  /** true when the condition reads sy-subrc or one of the variables */
  private isGuard(statement: StatementNode, guards: Set<string>): boolean {
    const tokens = statement.getTokens();
    for (let i = 0; i < tokens.length; i++) {
      const str = tokens[i].getStr().toUpperCase();
      const previous = i > 0 ? tokens[i - 1].getStr() : "";
      if (["-", "->", "=>", "~"].includes(previous)) {
        continue;
      }
      if ((str === "SY" && tokens[i + 1]?.getStr() === "-" && tokens[i + 2]?.getStr().toUpperCase() === "SUBRC")
          || guards.has(str)) {
        return true;
      }
    }
    return false;
  }

  private mentions(statement: StatementNode, name: string): boolean {
    return statement.getTokens().some(t => t.getStr().toUpperCase() === name);
  }

  /** true for a statement that can leave the current block, a call of a method named like RAISE counts */
  private leaves(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.Return
      || s instanceof Statements.Exit
      || s instanceof Statements.Continue
      || s instanceof Statements.Check
      || s instanceof Statements.Raise
      || s instanceof Statements.Leave
      || s instanceof Statements.Message
      || s instanceof Statements.Assert
      || (s instanceof Statements.Call && statement.getTokens().some(t => /raise/i.test(t.getStr())));
  }

  private opensBlock(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.If
      || s instanceof Statements.Case
      || s instanceof Statements.CaseType
      || s instanceof Statements.Loop
      || s instanceof Statements.LoopAtScreen
      || s instanceof Statements.LoopExtract
      || s instanceof Statements.Do
      || s instanceof Statements.While
      || s instanceof Statements.Try
      || s instanceof Statements.SelectLoop
      || s instanceof Statements.At
      || s instanceof Statements.AtFirst
      || s instanceof Statements.AtLast
      || s instanceof Statements.OnChange
      || s instanceof Statements.Provide
      || s instanceof Statements.CatchSystemExceptions;
  }

  private isBranch(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.ElseIf
      || s instanceof Statements.Else
      || s instanceof Statements.When
      || s instanceof Statements.WhenOthers
      || s instanceof Statements.WhenType
      || s instanceof Statements.Catch
      || s instanceof Statements.Cleanup;
  }

  private closesBlock(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.EndIf
      || s instanceof Statements.EndCase
      || s instanceof Statements.EndLoop
      || s instanceof Statements.EndDo
      || s instanceof Statements.EndWhile
      || s instanceof Statements.EndTry
      || s instanceof Statements.EndSelect
      || s instanceof Statements.EndAt
      || s instanceof Statements.EndOn
      || s instanceof Statements.EndProvide
      || s instanceof Statements.EndCatch;
  }

  private isBlockBoundary(statement: StatementNode): boolean {
    return this.startsBlock(statement) || this.endsBlock(statement);
  }

  private startsBlock(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.MethodImplementation
      || s instanceof Statements.Form
      || s instanceof Statements.FunctionModule
      || s instanceof Statements.Module;
  }

  private endsBlock(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.EndMethod
      || s instanceof Statements.EndForm
      || s instanceof Statements.EndFunction
      || s instanceof Statements.EndModule;
  }

}
