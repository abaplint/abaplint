import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {MethodCallChain} from "../expressions/method_call_chain";

export class Call {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const chain = node.findDirectExpression(Expressions.MethodCallChain);
    if (chain) {
      return new MethodCallChain().runSyntax(chain, scope, filename);
    }

    throw new Error("todo: CALL METHOD MethodSource MethodCallBody");
  }
}