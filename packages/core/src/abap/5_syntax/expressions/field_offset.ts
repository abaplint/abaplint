import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";
import {constantNumber} from "../_constant_operand";
import {FieldChain} from "./field_chain";

export class FieldOffset {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): number | undefined {

    const field = node.findDirectExpression(Expressions.SimpleFieldChain2);
    if (field) {
      FieldChain.runSyntax(field, input, ReferenceType.DataReadReference);
      return constantNumber(field, input);
    } else {
      return parseInt(node.getLastToken().getStr(), 10);
    }

  }
}