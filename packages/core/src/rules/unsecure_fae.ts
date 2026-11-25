import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode, StatementNode, StructureNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {ISpaghettiScope} from "../abap/5_syntax/_spaghetti_scope";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {Position} from "../position";

export class UnsecureFAEConf extends BasicRuleConfig {
}

const PROCEDURES = [Structures.Method, Structures.Form, Structures.FunctionModule];
const LOOPS = [Structures.Loop, Structures.Do, Structures.While, Structures.Select, Structures.LoopAtScreen];
const CALLS = [Statements.Call, Statements.CallFunction, Statements.Perform, Statements.Submit,
  Statements.RaiseEvent, Statements.CallTransaction];

export class UnsecureFAE implements IRule {
  private reg: IRegistry;
  private conf = new UnsecureFAEConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unsecure_fae",
      title: "Unsecure FAE",
      shortDescription: `Checks for unsecure FAE`,
      extendedInformation: `Issues from rule check_syntax must be fixed before this rule takes effect

The driver table of FOR ALL ENTRIES is considered checked, and no issue is reported, if
* the SELECT is in the IF or ELSEIF branch of a condition "itab IS NOT INITIAL", "NOT itab IS INITIAL"
  or "lines( itab ) > 0", also combined with AND, or
* "IF itab IS INITIAL. RETURN. ENDIF." or "CHECK itab IS NOT INITIAL." precedes the SELECT in the same method,
  form or function module, at the same or an outer block level, not inside a loop,

and the driver table is not changed between the check and the SELECT, or in a loop around the SELECT inside the
checked region. If the driver table is not a local variable or parameter, a method, function or form call in
between also invalidates the check.`,
      tags: [RuleTag.Experimental, RuleTag.Performance],
      badExample: `SELECT * FROM t000 FOR ALL ENTRIES IN @lt_list
  WHERE mandt = @lt_list-table_line INTO TABLE @DATA(lt_t000).`,
      goodExample: `IF lt_list IS NOT INITIAL.
  SELECT * FROM t000 FOR ALL ENTRIES IN @lt_list
    WHERE mandt = @lt_list-table_line INTO TABLE @DATA(lt_t000).
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: UnsecureFAEConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];
    if (!(obj instanceof ABAPObject)) {
      return issues;
    }

    const syntaxResult = new SyntaxLogic(this.reg, obj).run();
    if (syntaxResult.issues.length > 0) {
      return issues;
    }

    for (const f of obj.getABAPFiles()) {
      const structure = f.getStructure();
      if (structure === undefined) {
        continue;
      }
      for (const statement of structure.findAllStatementNodes()) {
        for (const e of statement.findAllExpressions(Expressions.SQLForAllEntries)) {
          if (this.isChecked(f, structure, statement, e, syntaxResult.spaghetti)) {
            continue;
          }
          const token = e.getFirstToken();
          const message = "Unsecure FAE";
          issues.push(Issue.atToken(f, token, message, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return issues;
  }

////////////////

  private isChecked(file: ABAPFile, root: StructureNode, statement: StatementNode, fae: ExpressionNode,
                    spaghetti: ISpaghettiScope): boolean {
    const source = fae.findDirectExpression(Expressions.SQLSource);
    const name = source?.concatTokens().replace(/^@/, "").replace(/\s/g, "").toUpperCase();
    if (name === undefined || /^[\w/<>~]+((->|=>)[\w/~]+)?$/.test(name) === false) {
      return false;
    }
    const path = this.findPath(root, statement, []);
    if (path === undefined) {
      return false;
    }
    const local = this.isLocal(file, name, statement.getStart(), spaghetti);

    for (let i = path.length - 1; i >= 0; i--) {
      const node = path[i];
      const type = node.get();
      if (PROCEDURES.some(p => type instanceof p)) {
        break;
      }
      const child = path[i + 1] ?? statement;
      const inner = path.slice(i + 1);

      // IF itab IS NOT INITIAL. SELECT ... ENDIF.
      if ((type instanceof Structures.If || type instanceof Structures.ElseIf) && child.get() instanceof Structures.Body) {
        const header = node.findDirectStatement(type instanceof Structures.If ? Statements.If : Statements.ElseIf);
        const cond = header?.findDirectExpression(Expressions.Cond);
        if (header && cond && this.notInitial(cond, name)
            && this.unchanged(file, inner, statement, header.getEnd(), name, local)) {
          return true;
        }
      }

      // IF itab IS INITIAL. RETURN. ENDIF. or CHECK itab IS NOT INITIAL. before the SELECT
      const outer = path.slice(0, i + 1);
      if (type instanceof Structures.Body
          && outer.some(n => PROCEDURES.some(p => n.get() instanceof p))
          && outer.some(n => LOOPS.some(l => n.get() instanceof l)) === false) {
        for (const sibling of node.getChildren()) {
          if (sibling === child) {
            break;
          }
          const content = sibling instanceof StructureNode && sibling.get() instanceof Structures.Normal
            ? sibling.getFirstChild() : sibling;
          if ((content instanceof StructureNode || content instanceof StatementNode)
              && this.leavesIfInitial(content, name)
              && this.unchanged(file, inner, statement, sibling.getLastToken().getEnd(), name, local)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private findPath(node: StructureNode, target: StatementNode, path: StructureNode[]): StructureNode[] | undefined {
    for (const child of node.getChildren()) {
      if (child === target) {
        return [...path, node];
      } else if (child instanceof StructureNode) {
        const found = this.findPath(child, target, [...path, node]);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  /** local variable or parameter of the procedure, calls cannot change it */
  private isLocal(file: ABAPFile, name: string, position: Position, spaghetti: ISpaghettiScope): boolean {
    if (name.includes("->") || name.includes("=>") || name.startsWith("<")) {
      return false;
    }
    let scope = spaghetti.lookupPosition(position, file.getFilename());
    while (scope?.getIdentifier().stype === ScopeType.OpenSQL) {
      scope = scope.getParent();
    }
    const stype = scope?.getIdentifier().stype;
    if (stype !== ScopeType.Method && stype !== ScopeType.Form && stype !== ScopeType.FunctionModule) {
      return false;
    }
    return scope?.getData().vars[name] !== undefined;
  }

  /** "itab IS NOT INITIAL" or "lines( itab ) > 0", possibly combined with AND */
  private notInitial(cond: ExpressionNode, name: string): boolean {
    const children = cond.getChildren();
    if (children.some(c => ["OR", "EQUIV"].includes(c.concatTokens().toUpperCase()))) {
      return false;
    }
    for (const child of children) {
      if (child instanceof ExpressionNode && child.get() instanceof Expressions.Compare) {
        const text = this.normalize(child);
        if ([`${name} IS NOT INITIAL`, `NOT ${name} IS INITIAL`,
          `LINES( ${name} ) > 0`, `LINES( ${name} ) GT 0`, `LINES( ${name} ) <> 0`, `LINES( ${name} ) NE 0`,
          `LINES( ${name} ) >= 1`, `LINES( ${name} ) GE 1`].includes(text)) {
          return true;
        }
      } else if (child instanceof ExpressionNode && child.get() instanceof Expressions.CondSub
          && child.getFirstToken().getStr().toUpperCase() !== "NOT") {
        const sub = child.findDirectExpression(Expressions.Cond);
        if (sub && this.notInitial(sub, name)) {
          return true;
        }
      }
    }
    return false;
  }

  /** "itab IS INITIAL" or "lines( itab ) = 0", possibly combined with OR */
  private initial(cond: ExpressionNode, name: string): boolean {
    const children = cond.getChildren();
    if (children.some(c => ["AND", "EQUIV"].includes(c.concatTokens().toUpperCase()))) {
      return false;
    }
    return children.some(c => c instanceof ExpressionNode && c.get() instanceof Expressions.Compare
      && [`${name} IS INITIAL`, `NOT ${name} IS NOT INITIAL`,
        `LINES( ${name} ) = 0`, `LINES( ${name} ) EQ 0`, `LINES( ${name} ) < 1`, `LINES( ${name} ) LT 1`]
        .includes(this.normalize(c)));
  }

  /** "IF itab IS INITIAL. RETURN. ENDIF." or "CHECK itab IS NOT INITIAL." */
  private leavesIfInitial(node: StructureNode | StatementNode, name: string): boolean {
    if (node instanceof StatementNode) {
      const cond = node.get() instanceof Statements.Check ? node.findDirectExpression(Expressions.Cond) : undefined;
      return cond !== undefined && this.notInitial(cond, name);
    }
    if (!(node.get() instanceof Structures.If)
        || node.findDirectStructure(Structures.Else) !== undefined
        || node.findDirectStructure(Structures.ElseIf) !== undefined) {
      return false;
    }
    const statements = node.findDirectStructure(Structures.Body)?.findAllStatementNodes() ?? [];
    if (statements.length !== 1 || !(statements[0].get() instanceof Statements.Return)) {
      return false;
    }
    const cond = node.findDirectStatement(Statements.If)?.findDirectExpression(Expressions.Cond);
    return cond !== undefined && this.initial(cond, name);
  }

  private normalize(node: ExpressionNode): string {
    return node.concatTokens().toUpperCase().replace(/\s+/g, " ");
  }

  /** the driver table is not changed after the check and before the SELECT, nor in a loop around the SELECT
   * inside the checked region */
  private unchanged(file: ABAPFile, inner: StructureNode[], statement: StatementNode, from: Position,
                    name: string, local: boolean): boolean {
    const loop = inner.find(n => LOOPS.some(l => n.get() instanceof l));
    const to = loop === undefined ? statement.getStart() : loop.getLastToken().getEnd();
    for (const s of file.getStatements()) {
      if (s === statement || !s.getStart().isAfter(from) || !s.getStart().isBefore(to)) {
        continue;
      }
      if (this.writes(s, name) || (local === false && this.calls(s))) {
        return false;
      }
    }
    return true;
  }

  private writes(statement: StatementNode, name: string): boolean {
    for (const target of [...statement.findAllExpressions(Expressions.Target),
      ...statement.findAllExpressions(Expressions.FSTarget)]) {
      const text = target.concatTokens().replace(/\s/g, "").toUpperCase();
      if (text === name || (text.startsWith(name) && /^[^\w/]/.test(text.substring(name.length)))) {
        return true;
      }
    }
    return false;
  }

  private calls(statement: StatementNode): boolean {
    const type = statement.get();
    return CALLS.some(c => type instanceof c)
      || statement.findFirstExpression(Expressions.MethodCall) !== undefined
      || statement.findFirstExpression(Expressions.MethodSource) !== undefined;
  }

}
