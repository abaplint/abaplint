import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {CSequenceType, StringType, UnknownType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";

export class InlineData {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, type: AbstractType | undefined): void {
    const token = node.findFirstExpression(Expressions.TargetField)?.getFirstToken();
    if (token && type) {
      if (type instanceof CSequenceType) {
        type = StringType.get();
      }
      const identifier = new TypedIdentifier(token, filename, type, [IdentifierMeta.InlineDefinition]);
      scope.addIdentifier(identifier);
      scope.addReference(token, identifier, ReferenceType.DataWriteReference, filename);
    } else if (token) {
      const message = "InlineData, could not determine type for \"" + token.getStr() + "\"";
      const identifier = new TypedIdentifier(token, filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
      scope.addIdentifier(identifier);
      scope.addReference(token, identifier, ReferenceType.DataWriteReference, filename);
    }
  }
}