import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {CGenericType, CLikeType, CSequenceType, StringType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class InlineData {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput, type: AbstractType | undefined): void {
    const token = node.findFirstExpression(Expressions.TargetField)?.getFirstToken();
    if (token && type) {
      if (type instanceof CSequenceType || type instanceof CLikeType) {
        type = StringType.get();
      } else if (type instanceof CGenericType) {
        const message = "InlineData, generic type C cannot be used for inferred type";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      if (type.isGeneric()) {
        const message = "DATA definition cannot be generic";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        type = VoidType.get(CheckSyntaxKey);
      }

      const identifier = new TypedIdentifier(token, input.filename, type, [IdentifierMeta.InlineDefinition]);
      input.scope.addIdentifier(identifier);
      input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
    } else if (token) {
      const message = "InlineData, could not determine type for \"" + token.getStr() + "\"";
      const identifier = new TypedIdentifier(token, input.filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
      input.scope.addIdentifier(identifier);
      input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
    }
  }
}