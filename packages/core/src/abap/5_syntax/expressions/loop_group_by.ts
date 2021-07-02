import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {IStructureComponent, StructureType, VoidType} from "../../types/basic";
import {CurrentScope} from "../_current_scope";
import {InlineFS} from "./inline_fs";

export class LoopGroupBy {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {

    const components: IStructureComponent[] = [];
    for (const c of node.findDirectExpressions(Expressions.ComponentCompare)) {
      for (const f of c.findDirectExpressions(Expressions.ComponentChainSimple)) {
        components.push({name: f.getFirstToken().getStr(), type: new VoidType("todoGroupBy")});
      }
    }
    if (components.length === 0) {
      return;
    }
    const sourceType = new StructureType(components);

    const inlinefs = node.findFirstExpression(Expressions.InlineFS);
    if (inlinefs) {
      new InlineFS().runSyntax(inlinefs, scope, filename, sourceType);
    }

  }
}