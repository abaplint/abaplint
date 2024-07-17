import {ExpressionNode} from "../../nodes";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

export class SourceFieldSymbol {
  public runSyntax(node: ExpressionNode, input: SyntaxInput) {
    const token = node.getFirstToken();
    const found = input.scope.findVariable(token.getStr());
    if (found === undefined) {
      throw new Error("\"" + node.getFirstToken().getStr() + "\" not found, SourceFieldSymbol");
    }
    input.scope.addReference(token, found, ReferenceType.DataReadReference, input.filename);
    return found.getType();
  }
}