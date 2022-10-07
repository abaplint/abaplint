import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";

export class FilterBody {
  public runSyntax(
    node: ExpressionNode | undefined,
    scope: CurrentScope,
    filename: string,
    targetType: AbstractType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return targetType;
    }

    let type: AbstractType | undefined = undefined;
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (type === undefined) {
        type = new Source().runSyntax(s, scope, filename);
      } else {
        new Source().runSyntax(s, scope, filename);
      }
    }

    return type ? type : targetType;
  }
}