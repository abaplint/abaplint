import {ExpressionNode} from "../../nodes";
import {VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class SourceFieldSymbol {
  public runSyntax(node: ExpressionNode, input: SyntaxInput): AbstractType {
    const token = node.getFirstToken();
    const found = input.scope.findVariable(token.getStr());
    if (found === undefined) {
      const message = "\"" + node.getFirstToken().getStr() + "\" not found, SourceFieldSymbol";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }
    input.scope.addReference(token, found, ReferenceType.DataReadReference, input.filename);
    return found.getType();
  }
}