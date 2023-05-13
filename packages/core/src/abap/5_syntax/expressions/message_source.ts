import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";

export class MessageSource {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string) {
    for (const f of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(f, scope, filename);
    }

    if (node.getFirstToken().getStr().toUpperCase() === "ID") {
      const id = node.findExpressionAfterToken("ID")?.concatTokens();
      const number = node.findDirectExpression(Expressions.MessageNumber)?.concatTokens();
      if (id?.startsWith("'") && number) {
        const messageClass = id.substring(1, id.length - 1).toUpperCase();
        scope.getMSAGReferences().addUsing(filename, node.getFirstToken(), messageClass, number);
      }
    } else {
      const typeAndNumber = node.findDirectExpression(Expressions.MessageTypeAndNumber)?.concatTokens();
      const messageNumber = typeAndNumber?.substring(1);
      const messageClass = node.findDirectExpression(Expressions.MessageClass)?.concatTokens().toUpperCase();
      if (messageNumber && messageClass) {
        scope.getMSAGReferences().addUsing(filename, node.getFirstToken(), messageClass, messageNumber);
      }
    }
  }
}