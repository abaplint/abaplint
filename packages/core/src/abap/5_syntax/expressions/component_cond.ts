import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput} from "../_syntax_input";
import {ComponentCompare} from "./component_compare";

export class ComponentCond {

  public runSyntax(node: ExpressionNode, input: SyntaxInput, type?: AbstractType): void {

    for (const t of node.findDirectExpressions(Expressions.ComponentCondSub)) {
      const c = t.findDirectExpression(Expressions.ComponentCond);
      if (c) {
        new ComponentCond().runSyntax(c, input, type);
      }
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCompare)) {
      new ComponentCompare().runSyntax(t, input, type);
    }

  }

}