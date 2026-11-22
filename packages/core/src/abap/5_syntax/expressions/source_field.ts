import {ExpressionNode} from "../../nodes";
import {VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {AbstractToken} from "../../1_lexer/tokens/abstract_token";
import {BuiltIn} from "../_builtin";

/** "me" is only available in instance methods, returns true if an issue was added */
export function checkMeInStaticMethod(found: TypedIdentifier, token: AbstractToken, input: SyntaxInput): boolean {
  if (found.getName().toLowerCase() === "me"
      && found.getFilename() === BuiltIn.filename
      && input.scope.isInStaticMethod() === true) {
    input.issues.push(syntaxIssue(input, token, "\"me\" cannot be used in static methods"));
    return true;
  }
  return false;
}

export class SourceField {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput, type?: ReferenceType | ReferenceType[],
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
    } else if (checkMeInStaticMethod(found, token, input) === true) {
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