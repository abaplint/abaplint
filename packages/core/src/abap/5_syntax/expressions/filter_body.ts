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

    const types: (AbstractType | undefined)[] = [];
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      types.push(Source.runSyntax(s, input));
    }

    const inputRowType = types[0] instanceof TableType ? types[0].getRowType() : undefined;
    const filterRowType = types[1] instanceof TableType ? types[1].getRowType() : undefined;
    ComponentCond.runSyntax(node.findDirectExpression(Expressions.ComponentCond)!, input, inputRowType, filterRowType);

    return types[0] ? types[0] : targetType;
  }
}
