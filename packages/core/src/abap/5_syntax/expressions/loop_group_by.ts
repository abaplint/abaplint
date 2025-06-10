import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {VoidType} from "../../types/basic";
import {ComponentCompare} from "./component_compare";
import {InlineData} from "./inline_data";
import {FSTarget} from "./fstarget";
import {Target} from "./target";
import {SyntaxInput} from "../_syntax_input";
import {Source} from "./source";

export class LoopGroupBy {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): void {

    for (const t of node.findAllExpressions(Expressions.Target)) {
      const inline = t.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, VoidType.get("todoGroupBy"));
      } else {
        Target.runSyntax(t, input);
      }
    }

    for (const t of node.findAllExpressions(Expressions.FSTarget)) {
      FSTarget.runSyntax(t, input, VoidType.get("todoGroupBy"));
    }

    for (const t of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(t, input, VoidType.get("todoGroupBy"));
    }

    for (const c of node.findDirectExpressions(Expressions.LoopGroupByComponent)) {
      for (const t of c.findDirectExpressions(Expressions.ComponentCompareSingle)) {
        ComponentCompare.runSyntax(t, input);
      }
    }

  }
}