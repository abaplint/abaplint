import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput} from "../_syntax_input";

export class CorrespondingBody {
  public static runSyntax(
    node: ExpressionNode | undefined,
    input: SyntaxInput,
    targetType: AbstractType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return targetType;
    }

    const base = node.findDirectExpression(Expressions.CorrespondingBodyBase)?.findDirectExpression(Expressions.Source);
    if (base) {
      Source.runSyntax(base, input, targetType);
    }

    let type: AbstractType | undefined = undefined;
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (type === undefined) {
        type = Source.runSyntax(s, input);
      } else {
        Source.runSyntax(s, input);
      }
    }

    return targetType ? targetType : type;
  }
}