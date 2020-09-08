import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";
import {Dynamic} from "./dynamic";

export class MethodSource {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string) {
    // todo

    const chain = node.findDirectExpression(Expressions.FieldChain);
    if (chain) {
      new FieldChain().runSyntax(chain, scope, filename, ReferenceType.DataReadReference);
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, scope, filename);
    }

  }

}