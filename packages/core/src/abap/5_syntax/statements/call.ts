import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {MethodCallChain} from "../expressions/method_call_chain";
import {MethodSource} from "../expressions/method_source";
import {MethodCallBody} from "../expressions/method_call_body";
import {VoidType} from "../../types/basic/void_type";
import {StatementSyntax} from "../_statement_syntax";

export class Call implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const chain = node.findDirectExpression(Expressions.MethodCallChain);
    if (chain) {
      new MethodCallChain().runSyntax(chain, scope, filename);
      return;
    }

    const methodSource = node.findDirectExpression(Expressions.MethodSource);
    if (methodSource === undefined) {
      throw new Error("Call, child MethodSource not found");
    }
    new MethodSource().runSyntax(methodSource, scope, filename);

    const body = node.findDirectExpression(Expressions.MethodCallBody);
    if (body) {
      // todo, resove the method definition above and pass, if possible, in case of dynamic pass void
      new MethodCallBody().runSyntax(body, scope, filename, new VoidType("CallTODO"));
    }

  }
}