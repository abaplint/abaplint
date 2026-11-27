import {ExpressionNode, TokenNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {checkParenthesizedOperand} from "../_parenthesized_operand";
import {Target} from "./target";
import {SyntaxInput} from "../_syntax_input";
import {AbstractType} from "../../types/basic/_abstract_type";

export class ReduceNext {
  public static runSyntax(node: ExpressionNode | undefined, input: SyntaxInput): void {
    if (node === undefined) {
      return;
    }

    const types = new Map<ExpressionNode, AbstractType | undefined>();

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      checkParenthesizedOperand(s, input);
      types.set(s, Source.runSyntax(s, input));
    }

    for (const s of node.findDirectExpressions(Expressions.SimpleTarget)) {
      types.set(s, Target.runSyntax(s, input));
    }

    this.checkCalculations(node, types, input);
  }

  // "NEXT x += y", the operators "+=", "-=", "*=" and "/=" calculate with the target and the source
  private static checkCalculations(node: ExpressionNode, types: Map<ExpressionNode, AbstractType | undefined>,
                                   input: SyntaxInput) {
    let target: ExpressionNode | undefined = undefined;
    let operator = "";
    for (const child of node.getChildren()) {
      if (child instanceof TokenNode) {
        operator += child.concatTokens();
      } else if (child.get() instanceof Expressions.SimpleTarget) {
        target = child;
        operator = "";
      } else if (target && /^[-+*\/]=$/.test(operator)
          && (Source.reportNonNumericOperand(types.get(target), target, input)
            || Source.reportNonNumericOperand(types.get(child), child, input))) {
        return;
      }
    }
  }
}