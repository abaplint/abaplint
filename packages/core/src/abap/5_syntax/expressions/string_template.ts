import {ExpressionNode} from "../../nodes";
import {StringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";

export class StringTemplate {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): AbstractType {
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    return new StringType();
  }
}