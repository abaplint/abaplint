import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput} from "../_syntax_input";
import {ComponentCond} from "./component_cond";
import {TableType} from "../../types/basic";

export class FilterBody {
  public static runSyntax(
    node: ExpressionNode | undefined,
    input: SyntaxInput,
    targetType: AbstractType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return targetType;
    }

    let type: AbstractType | undefined = undefined;
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (type === undefined) {
        type = Source.runSyntax(s, input);
      } else {
        Source.runSyntax(s, input);
      }
    }

    const rowType = type instanceof TableType ? type.getRowType() : undefined;
    ComponentCond.runSyntax(node.findDirectExpression(Expressions.ComponentCond)!, input, rowType);

    return type ? type : targetType;
  }
}