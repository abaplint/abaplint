import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ReferenceType} from "../_reference";
import {FieldChain} from "./field_chain";

export class FieldOffset {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): number | undefined {

    const field = node.findDirectExpression(Expressions.SimpleFieldChain2);
    if (field) {
      new FieldChain().runSyntax(field, scope, filename, ReferenceType.DataReadReference);
      return undefined;
    } else {
      return parseInt(node.getLastToken().getStr(), 10);
    }

  }
}