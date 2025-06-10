import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";
import {FieldChain} from "./field_chain";

export class FieldLength {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): number | undefined {

    const field = node.findDirectExpression(Expressions.SimpleFieldChain2);
    if (field) {
      FieldChain.runSyntax(field, input, ReferenceType.DataReadReference);
      return undefined;
    } else {
      const children = node.getChildren();
      const num = children[children.length - 2];
      if (num.getLastToken().getStr() === "*") {
        return undefined;
      }
      return parseInt(num.getLastToken().getStr(), 10);
    }

  }
}