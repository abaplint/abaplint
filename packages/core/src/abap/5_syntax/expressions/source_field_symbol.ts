import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ReferenceType} from "../_reference";

export class SourceFieldSymbol {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string) {
    const token = node.getFirstToken();
    const found = scope.findVariable(token.getStr());
    if (found === undefined) {
      throw new Error("\"" + node.getFirstToken().getStr() + "\" not found, SourceFieldSymbol");
    }
    scope.addReference(token, found, ReferenceType.DataReadReference, filename);
    return found.getType();
  }
}