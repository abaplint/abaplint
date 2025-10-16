import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {TypeUtils} from "../_type_utils";
import {ComponentChain} from "./component_chain";
import {Source} from "./source";

export class ComponentCompareSimple {

  public static runSyntax(node: ExpressionNode, input: SyntaxInput, rowType: AbstractType): void {
    let targetType: AbstractType | undefined = undefined;
    for (const c of node.getChildren()) {
      if (c instanceof ExpressionNode) {
        if (c.get() instanceof Expressions.ComponentChainSimple) {
          targetType = ComponentChain.runSyntax(rowType, c, input);
        } else if (c.get() instanceof Expressions.Dynamic) {
          targetType = undefined;
        } else if (c.get() instanceof Expressions.Source
            || c.get() instanceof Expressions.SimpleSource4
            || c.get() instanceof Expressions.SimpleSource2) {
          const sourceType = Source.runSyntax(c, input, targetType);
          if (targetType && new TypeUtils(input.scope).isAssignable(sourceType, targetType) === false) {
            const message = "ComponentCompareSimple, incompatible types";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return;
          }
        } else {
          const message = "ComponentCompareSimple, unexpected node";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
    }
  }

}