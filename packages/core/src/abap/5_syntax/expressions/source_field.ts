import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ReferenceType} from "../_reference";

export class SourceField {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, type?: ReferenceType | ReferenceType[]) {
    const token = node.getFirstToken();
    const name = token.getStr();
    const found = scope.findVariable(name);
    if (found === undefined) {
      throw new Error("\"" + name + "\" not found, findTop");
    }
    if (type) {
      scope.addReference(token, found, type, filename);
    }
    if (name.includes("~")) {
      const idef = scope.findInterfaceDefinition(name.split("~")[0]);
      if (idef) {
        scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, filename);
      }
    }
    return found.getType();
  }
}