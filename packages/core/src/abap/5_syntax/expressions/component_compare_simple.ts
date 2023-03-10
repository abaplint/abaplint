import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CurrentScope} from "../_current_scope";
import {ComponentChain} from "./component_chain";
import {Source} from "./source";

export class ComponentCompareSimple {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, rowType: AbstractType): void {
    let targetType: AbstractType | undefined = undefined;
    for (const c of node.getChildren()) {
      if (c instanceof ExpressionNode) {
        if (c.get() instanceof Expressions.ComponentChainSimple) {
          targetType = new ComponentChain().runSyntax(rowType, c, scope, filename);
        } else if (c.get() instanceof Expressions.Dynamic) {
          targetType = undefined;
        } else if (c.get() instanceof Expressions.Source) {
          new Source().runSyntax(c, scope, filename, targetType);
        } else {
          throw "ComponentCompareSimple, unexpected node";
        }
      }
    }
  }

}