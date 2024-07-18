import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

export class SourceField {
  public runSyntax(node: ExpressionNode, input: SyntaxInput, type?: ReferenceType | ReferenceType[]): AbstractType {
    const token = node.getFirstToken();
    const name = token.getStr();
    const found = input.scope.findVariable(name);
    if (found === undefined) {
      // TODOSYNTAX, catch in method_source
      throw new Error("\"" + name + "\" not found, findTop");
    }
    if (type) {
      input.scope.addReference(token, found, type, input.filename);
    }
    if (name.includes("~")) {
      const idef = input.scope.findInterfaceDefinition(name.split("~")[0]);
      if (idef) {
        input.scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, input.filename);
      }
    }
    return found.getType();
  }
}