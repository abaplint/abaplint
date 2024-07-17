import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {Let} from "./let";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput} from "../_syntax_input";

export class ConvBody {
  public runSyntax(node: ExpressionNode | undefined, input: SyntaxInput): AbstractType | undefined {
    if (node === undefined) {
      throw new Error("ConvBody, node undefined");
    }

    let scoped = false;
    const l = node.findDirectExpression(Expressions.Let);
    if (l) {
      scoped = new Let().runSyntax(l, input);
    }

    const s = node.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      throw new Error("ConvBody, no source found");
    }
    const sourceType = new Source().runSyntax(s, input);

    if (scoped === true) {
      input.scope.pop(node.getLastToken().getEnd());
    }

    return sourceType;
  }
}