import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic";

export class SwitchBody {
  public runSyntax(node: ExpressionNode | undefined, input: SyntaxInput): AbstractType | undefined {
    if (node === undefined) {
      return;
    }

    const thenSource = node.findExpressionAfterToken("THEN");
    if (!(thenSource?.get() instanceof Expressions.Source)) {
      const message = "SwitchBody, unexpected";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }
    const type = new Source().runSyntax(thenSource, input);

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (s === thenSource) {
        continue;
      }
      new Source().runSyntax(s, input);
    }

    return type;
  }
}