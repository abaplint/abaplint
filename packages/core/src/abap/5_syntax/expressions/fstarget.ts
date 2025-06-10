import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {InlineFS} from "./inline_fs";
import {ReferenceType} from "../_reference";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class FSTarget {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput, type: AbstractType | undefined): void {

    const inlinefs = node?.findDirectExpression(Expressions.InlineFS);
    if (inlinefs) {
      InlineFS.runSyntax(inlinefs, input, type);
    }

    const target = node?.findDirectExpression(Expressions.TargetFieldSymbol);
    if (target) {
      const token = target.getFirstToken();
      const found = input.scope.findVariable(token.getStr());
      if (found === undefined) {
        const message = `"${token.getStr()}" not found, FSTarget`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      input.scope.addReference(token, found, ReferenceType.DataWriteReference, input.filename);
    }

  }
}