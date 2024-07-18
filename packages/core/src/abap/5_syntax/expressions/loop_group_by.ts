import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {VoidType} from "../../types/basic";
import {ComponentCompare} from "./component_compare";
import {InlineData} from "./inline_data";
import {FSTarget} from "./fstarget";
import {Target} from "./target";
import {SyntaxInput} from "../_syntax_input";

export class LoopGroupBy {
  public runSyntax(node: ExpressionNode, input: SyntaxInput): void {

    for (const t of node.findAllExpressions(Expressions.Target)) {
      const inline = t.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, input, new VoidType("todoGroupBy"));
      } else {
        new Target().runSyntax(t, input);
      }
    }
    for (const t of node.findAllExpressions(Expressions.FSTarget)) {
      new FSTarget().runSyntax(t, input, new VoidType("todoGroupBy"));
    }

    for (const c of node.findDirectExpressions(Expressions.LoopGroupByComponent)) {
      for (const t of c.findDirectExpressions(Expressions.ComponentCompareSingle)) {
        new ComponentCompare().runSyntax(t, input);
      }
    }

  }
}