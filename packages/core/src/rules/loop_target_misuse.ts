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

export class LoopTargetMisuseConf extends BasicRuleConfig {
  /** Report a LOOP inside a LOOP with the same target, when the outer loop body uses the target after the inner ENDLOOP */
  public nestedLoop: boolean = true;
  /** Report LOOP AT ... INTO <fs> and READ TABLE ... INTO <fs> when the local field symbol is only bound by ASSIGNING,
   * so the statement overwrites a table row */
  public intoFieldSymbol: boolean = true;
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
no ASSIGN and no STRUCTURE ... DEFAULT binds it there, so it can only point to a table row.`,
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
READ TABLE lt_a INTO <ls_a> INDEX 1.`,
      goodExample: `LOOP AT lt_header INTO ls_row.
  LOOP AT lt_items INTO ls_item WHERE parent = ls_row-id.
    lv_sum = lv_sum + ls_item-amount.
  ENDLOOP.
  ls_row-amount = lv_sum.
  APPEND ls_row TO lt_result.
ENDLOOP.

LOOP AT lt_a ASSIGNING <ls_a>.
ENDLOOP.
READ TABLE lt_a ASSIGNING <ls_a> INDEX 1.`,
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
      if (s instanceof Statements.Loop) {
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
