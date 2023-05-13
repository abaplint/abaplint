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
      const number = node.findExpressionAfterToken("NUMBER")?.concatTokens();
      if (id?.startsWith("'") && number?.startsWith("'")) {
        const messageNumber = parseInt(number.substring(1, number.length - 2), 10);
        const messageClass = id.substring(1, id.length - 2);
        scope.getMSAGReferences().addUsing(filename, node.getFirstToken(), messageClass, messageNumber);
      }
    } else {
      const typeAndNumber = node.findDirectExpression(Expressions.MessageTypeAndNumber)?.concatTokens();
      const messageNumber = parseInt(typeAndNumber?.substring(1) || "", 10);
      const messageClass = node.findDirectExpression(Expressions.MessageClass)?.concatTokens().toUpperCase();
      if (messageNumber && messageClass) {
        scope.getMSAGReferences().addUsing(filename, node.getFirstToken(), messageClass, messageNumber);
      }
    }
  }
}