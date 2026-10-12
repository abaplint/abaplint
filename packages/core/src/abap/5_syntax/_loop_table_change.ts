import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import {ExpressionNode, StatementNode, StructureNode, TokenNode} from "../nodes";
import {TypedIdentifier} from "../types/_typed_identifier";
import {TableType} from "../types/basic";
import {CurrentScope} from "./_current_scope";
import {ScopeType} from "./_scope_type";
import {SyntaxInput, syntaxIssue} from "./_syntax_input";

/** In a method, the body of the table an enclosing LOOP AT walks cannot be replaced or freed,
 *  "you cannot access the entire table body in change mode in a loop. If this is known statically,
 *  a syntax error occurs in classes", see the ABAP keyword documentation for LOOP AT itab.
 *  Only tables named directly are handled, a field symbol or a reference is a runtime matter. */
export class LoopTableChange {
  private readonly tables: TypedIdentifier[] = [];

  /** returns true if the LOOP structure was pushed, then pop() must be called after it */
  public push(node: StructureNode, scope: CurrentScope): boolean {
    if (scope.getType() !== ScopeType.Method) {
      return false;
    }
    const loop = node.findDirectStatement(Statements.Loop);
    if (loop === undefined || loop.findDirectExpression(Expressions.LoopGroupBy) !== undefined) {
      return false;
    }
    const chain = loop.findDirectExpression(Expressions.LoopSource)
      ?.findDirectExpression(Expressions.SimpleSource2)
      ?.findDirectExpression(Expressions.FieldChain);
    const children = chain?.getChildren() || [];
    if (children.length !== 1 && !(children.length === 2 && children[1].get() instanceof Expressions.TableBody)) {
      return false;
    }
    const found = LoopTableChange.findTable(children[0], scope);
    if (found === undefined) {
      return false;
    }
    this.tables.push(found);
    return true;
  }

  public pop(): void {
    this.tables.pop();
  }

  public check(node: StatementNode, input: SyntaxInput): void {
    if (this.tables.length === 0 || input.scope.getType() !== ScopeType.Method) {
      return;
    }

    // DELETE itab WHERE is not refused, abapGit does it in zcl_abapgit_syntax_xml->order_matches,
    // SORT is left out, it is not certain that it is checked statically
    const s = node.get();
    if (!(s instanceof Statements.Clear)
        && !(s instanceof Statements.Free)
        && !(s instanceof Statements.Refresh)
        && !(s instanceof Statements.Move)) {
      return;
    }

    for (const target of node.findDirectExpressions(Expressions.Target)) {
      const children = target.getChildren();
      const body = children.length === 2 && children[1].get() instanceof Expressions.TableBody;
      if (children.length !== 1 && body === false) {
        continue;
      } else if (!(children[0].get() instanceof Expressions.TargetField)) {
        continue;
      }
      const found = LoopTableChange.findTable(children[0], input.scope);
      if (found === undefined || this.tables.includes(found) === false) {
        continue;
      } else if ((found.getType() as TableType).isWithHeader() === true && body === false) {
        // without [] the statement works on the header line
        continue;
      }
      const message = `"${found.getName()}" cannot be changed as a whole inside a LOOP over it`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }
  }

  private static findTable(node: ExpressionNode | TokenNode | undefined, scope: CurrentScope): TypedIdentifier | undefined {
    if (!(node instanceof ExpressionNode)
        || node.getChildren().length !== 1
        || !(node.getFirstChild()?.get() instanceof Expressions.Field)) {
      return undefined;
    }
    const found = scope.findVariable(node.concatTokens());
    if (found === undefined || !(found.getType() instanceof TableType)) {
      return undefined;
    }
    return found;
  }
}
