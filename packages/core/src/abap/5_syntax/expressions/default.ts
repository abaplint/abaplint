import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";
import {Constant} from "./constant";

export class Default {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string) {

    const chain = node.findDirectExpression(Expressions.FieldChain);
    if (chain) {
      return new FieldChain().runSyntax(chain, scope, filename, ReferenceType.DataReadReference);
    }

    const constant = node.findDirectExpression(Expressions.Constant);
    if (constant) {
      return new Constant().runSyntax(constant);
    }

    return undefined;
  }
}