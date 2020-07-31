import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {For} from "./for";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";
import {InlineFieldDefinition} from "./inline_field_definition";
import {UnknownType} from "../../types/basic/unknown_type";

export class ReduceBody {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string): AbstractType | undefined {
    if (node === undefined) {
      return;
    }

    for (const i of node.findDirectExpressions(Expressions.InlineFieldDefinition)) {
      new InlineFieldDefinition().runSyntax(i, scope, filename);
    }

    const forNode = node.findDirectExpression(Expressions.For);
    if (forNode) {
      new For().runSyntax(forNode, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    return new UnknownType("todo, ReduceBody");
  }
}