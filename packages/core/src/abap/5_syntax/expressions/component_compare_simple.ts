import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput} from "../_syntax_input";
import {TypeUtils} from "../_type_utils";
import {ComponentChain} from "./component_chain";
import {Source} from "./source";

export class ComponentCompareSimple {

  public runSyntax(node: ExpressionNode, input: SyntaxInput, rowType: AbstractType): void {
    let targetType: AbstractType | undefined = undefined;
    for (const c of node.getChildren()) {
      if (c instanceof ExpressionNode) {
        if (c.get() instanceof Expressions.ComponentChainSimple) {
          targetType = new ComponentChain().runSyntax(rowType, c, input);
        } else if (c.get() instanceof Expressions.Dynamic) {
          targetType = undefined;
        } else if (c.get() instanceof Expressions.Source) {
          const sourceType = new Source().runSyntax(c, input, targetType);
          if (targetType && new TypeUtils(input.scope).isAssignable(sourceType, targetType) === false) {
            throw new Error("ComponentCompareSimple, incompatible types");
          }
        } else {
          throw new Error("ComponentCompareSimple, unexpected node");
        }
      }
    }
  }

}