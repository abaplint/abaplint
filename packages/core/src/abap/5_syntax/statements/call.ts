import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {MethodCallChain} from "../expressions/method_call_chain";
import {MethodSource} from "../expressions/method_source";
import {MethodCallBody} from "../expressions/method_call_body";
import {VoidType} from "../../types/basic/void_type";
import {StatementSyntax} from "../_statement_syntax";

export class Call implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const children = node.getChildren();

    if (children.length === 2) {
      const first = children[0] as ExpressionNode;
      new MethodCallChain().runSyntax(first, scope, filename);
      return;
    }

    const methodSource = children[2] as ExpressionNode;
    if (methodSource === undefined) {
      throw new Error("Call, child MethodSource not found");
    }
    const methodDef = new MethodSource().runSyntax(methodSource, scope, filename);

    const body = children[3];
    if (body instanceof ExpressionNode) {
      // todo, resolve the method definition above and pass, if possible, in case of dynamic pass void
      new MethodCallBody().runSyntax(body, scope, filename, methodDef || new VoidType("CallTODO"));
    }

  }
}