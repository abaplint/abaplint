import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

export class InlineFS {
  public runSyntax(node: ExpressionNode, input: SyntaxInput, type: AbstractType | undefined): void {
    const token = node.findFirstExpression(Expressions.TargetFieldSymbol)?.getFirstToken();
    if (token && type) {
      const identifier = new TypedIdentifier(token, input.filename, type, [IdentifierMeta.InlineDefinition]);
      input.scope.addIdentifier(identifier);
      input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
    } else if (token) {
      const message = "InlineFS, could not determine type for \"" + token.getStr() + "\"";
      const identifier = new TypedIdentifier(token, input.filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
      input.scope.addIdentifier(identifier);
      input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
    }
  }
}