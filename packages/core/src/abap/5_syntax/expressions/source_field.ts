import {ExpressionNode} from "../../nodes";
import {VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class SourceField {
  public runSyntax(node: ExpressionNode, input: SyntaxInput, type?: ReferenceType | ReferenceType[],
                   error = true): AbstractType | undefined {
    const token = node.getFirstToken();
    const name = token.getStr();

    const found = input.scope.findVariable(name);
    if (found === undefined) {
      const message = "\"" + name + "\" not found, findTop";
      if (error === true) {
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      }
      return VoidType.get(CheckSyntaxKey);
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