import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {SyntaxInput} from "../_syntax_input";

export class MessageSource {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput) {
    for (const f of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(f, input);
    }

    if (node.getFirstToken().getStr().toUpperCase() === "ID") {
      const id = node.findExpressionAfterToken("ID")?.concatTokens();
      let number = node.findDirectExpression(Expressions.MessageNumber)?.concatTokens();
      if (number === undefined) {
        const num = node.findExpressionAfterToken("NUMBER")?.concatTokens();
        if (num?.startsWith("'")) {
          number = num.substring(1, num.length - 1).toUpperCase();
        }
      }
      if (id?.startsWith("'") && number) {
        const messageClass = id.substring(1, id.length - 1).toUpperCase();
        input.scope.getMSAGReferences().addUsing(input.filename, node.getFirstToken(), messageClass, number);
      }
    } else {
      const typeAndNumber = node.findDirectExpression(Expressions.MessageTypeAndNumber)?.concatTokens();
      const messageNumber = typeAndNumber?.substring(1);
      const messageClass = node.findDirectExpression(Expressions.MessageClass)?.concatTokens().toUpperCase();
      if (messageNumber && messageClass) {
        input.scope.getMSAGReferences().addUsing(input.filename, node.getFirstToken(), messageClass, messageNumber);
      }
    }
  }
}