import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {Let} from "./let";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {VoidType} from "../../types/basic";

export class ConvBody {
  public runSyntax(node: ExpressionNode, input: SyntaxInput): AbstractType | undefined {
    let scoped = false;
    const l = node.findDirectExpression(Expressions.Let);
    if (l) {
      scoped = new Let().runSyntax(l, input);
    }

    const s = node.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      const message = "ConvBody, no source found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return new VoidType(CheckSyntaxKey);
    }
    const sourceType = new Source().runSyntax(s, input);

    if (scoped === true) {
      input.scope.pop(node.getLastToken().getEnd());
    }

    return sourceType;
  }
}