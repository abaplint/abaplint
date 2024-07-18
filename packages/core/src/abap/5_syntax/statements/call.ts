import {ExpressionNode, StatementNode} from "../../nodes";
import {MethodCallChain} from "../expressions/method_call_chain";
import {MethodSource} from "../expressions/method_source";
import {MethodCallBody} from "../expressions/method_call_body";
import {VoidType} from "../../types/basic/void_type";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Call implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const children = node.getChildren();

    if (children.length === 2) {
      const first = children[0] as ExpressionNode;
      new MethodCallChain().runSyntax(first, input);
      return;
    }

    const methodSource = children[2] as ExpressionNode;
    if (methodSource === undefined) {
      const message = "Call, child MethodSource not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }
    const methodDef = new MethodSource().runSyntax(methodSource, input);

    const body = children[3];
    if (body instanceof ExpressionNode) {
      // todo, resolve the method definition above and pass, if possible, in case of dynamic pass void
      new MethodCallBody().runSyntax(body, input, methodDef || new VoidType("CallTODO"));
    }

  }
}