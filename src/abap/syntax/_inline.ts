import {Variables} from "./_variables";
import {TypedIdentifier} from "../types/_typed_identifier";
import {ExpressionNode} from "../nodes";
import * as Expressions from "../expressions";
import {INode} from "../nodes/_inode";

class LocalIdentifier extends TypedIdentifier { }

export class Inline {
  private variables: Variables;

  constructor(variables: Variables) {
    this.variables = variables;
  }

  private addVariable(expr: ExpressionNode | undefined) {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    this.variables.add(new LocalIdentifier(token, expr));
  }

  public update(node: INode) {
    if (node instanceof ExpressionNode) {
// todo, this will add the variable multiple times if there are expressions in multiple levels?
      for (const inline of node.findAllExpressions(Expressions.InlineData)) {
        const field = inline.findFirstExpression(Expressions.Field);
        if (field === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
        this.addVariable(field);
      }
      for (const inline of node.findAllExpressions(Expressions.InlineFor)) {
        const field = inline.findFirstExpression(Expressions.Field);
        if (field !== undefined) {
          this.addVariable(field);
// todo, these also have to be popped after the statement
        }
      }
    }
  }
}