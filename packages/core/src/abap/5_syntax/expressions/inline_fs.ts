import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";

export class InlineFS {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, type: AbstractType | undefined): void {
    const token = node.findFirstExpression(Expressions.TargetFieldSymbol)?.getFirstToken();
    if (token && type) {
      const identifier = new TypedIdentifier(token, filename, type, [IdentifierMeta.InlineDefinition]);
      scope.addIdentifier(identifier);
      scope.addReference(token, identifier, ReferenceType.DataWriteReference, filename);
    } else if (token) {
      const message = "InlineFS, could not determine type for \"" + token.getStr() + "\"";
      const identifier = new TypedIdentifier(token, filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
      scope.addIdentifier(identifier);
      scope.addReference(token, identifier, ReferenceType.DataWriteReference, filename);
    }
  }
}