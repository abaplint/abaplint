import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ReferenceType} from "../_reference";

export class DatabaseTable {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {
    const token = node.getFirstToken();
    const name = token.getStr();
    if (name === "(") {
      // dynamic
      return;
    }

    const found = scope.getDDIC().lookupTableOrView2(name);
    if (found === undefined && scope.getDDIC().inErrorNamespace(name) === true) {
      throw new Error("Database table or view \"" + name + "\" not found");
    } else if (found === undefined) {
      scope.addReference(token, undefined, ReferenceType.TableVoidReference, filename);
    } else {
      scope.addReference(token, found.getIdentifier(), ReferenceType.TableReference, filename);
      scope.getDDICReferences().addUsing(scope.getParentObj(), {object: found, token: token, filename: filename});
    }
  }
}