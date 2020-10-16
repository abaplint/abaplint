import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";

export class Default {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string) {

    const chain = node.findDirectExpression(Expressions.FieldChain);
    if (chain) {
      new FieldChain().runSyntax(chain, scope, filename, ReferenceType.DataReadReference);
    }

  }
}