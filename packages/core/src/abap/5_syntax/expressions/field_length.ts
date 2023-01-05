import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {FieldChain} from "./field_chain";

export class FieldLength {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {

    const field = node.findDirectExpression(Expressions.SimpleFieldChain2);
    if (field) {
      new FieldChain().runSyntax(field, scope, filename);
    }

  }
}