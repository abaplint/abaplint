import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {IStructureComponent, StructureType, VoidType} from "../../types/basic";
import {CurrentScope} from "../_current_scope";
import {ComponentCompare} from "./component_compare";
import {InlineData} from "./inline_data";
import {InlineFS} from "./inline_fs";
import {Target} from "./target";

export class LoopGroupBy {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {

    const components: IStructureComponent[] = [];
    for (const c of node.findDirectExpressions(Expressions.LoopGroupByComponent)) {
      components.push({name: c.getFirstToken().getStr(), type: new VoidType("todoGroupBy")});
    }
    if (components.length === 0) {
      return;
    }
    const sourceType = new StructureType(components);


    for (const t of node.findAllExpressions(Expressions.Target)) {
      const inline = t.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new VoidType("todoGroupBy"));
      } else {
        new Target().runSyntax(t, scope, filename);
      }
    }

    const inlinefs = node.findFirstExpression(Expressions.InlineFS);
    if (inlinefs) {
      new InlineFS().runSyntax(inlinefs, scope, filename, sourceType);
    }

    for (const c of node.findDirectExpressions(Expressions.LoopGroupByComponent)) {
      for (const t of c.findDirectExpressions(Expressions.ComponentCompareSimple)) {
        new ComponentCompare().runSyntax(t, scope, filename);
      }
    }

  }
}