import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {ComponentChain} from "./component_chain";
import {ComponentName} from "./component_name";
import {Source} from "./source";

export class ComponentCompare {

  public static runSyntax(
    node: ExpressionNode,
    input: SyntaxInput,
    leftType?: AbstractType,
    rightType?: AbstractType): void {

    const chain = node.findDirectExpression(Expressions.ComponentChainSimple);
    if (chain === undefined) {
      const message = "ComponentCompare, chain not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const fieldType = ComponentChain.runSyntax(leftType, chain, input);

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      const fieldChain = s.findDirectExpression(Expressions.FieldChain);
      const first = fieldChain?.getFirstChild();
      if (rightType && fieldChain && first) {
        let sourceType: AbstractType | undefined = rightType;
        if (first.concatTokens().toUpperCase() !== "TABLE_LINE") {
          sourceType = ComponentName.runSyntax(sourceType, first, input);
        }
        ComponentChain.runSyntax(sourceType, fieldChain, input);
      } else {
        Source.runSyntax(s, input, fieldType);
      }
    }
  }

}
