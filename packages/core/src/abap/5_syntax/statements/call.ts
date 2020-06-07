import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {MethodCallChain} from "../expressions/method_call_chain";
import {MethodSource} from "../expressions/method_source";

export class Call {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const chain = node.findDirectExpression(Expressions.MethodCallChain);
    if (chain) {
      new MethodCallChain().runSyntax(chain, scope, filename);
      return;
    }

    const dynamic = node.findDirectExpression(Expressions.MethodSource)?.findDirectExpression(Expressions.Dynamic);
    if (dynamic) {
      return;
    }

    const methodSource = node.findDirectExpression(Expressions.MethodSource);
    if (methodSource === undefined) {
      throw new Error("Call, child MethodSource not found");
    }
    new MethodSource().runSyntax(methodSource, scope, filename);

  }
}