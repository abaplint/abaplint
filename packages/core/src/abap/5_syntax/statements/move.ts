import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic/unknown_type";

export class Move {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const target = node.findDirectExpression(Expressions.Target);

    const source = node.findDirectExpression(Expressions.Source);
    const sourceType = source ? new Source().runSyntax(source, scope, filename) : undefined;

    if (target?.findDirectExpression(Expressions.InlineData)) {
      const token = target.findFirstExpression(Expressions.TargetField)?.getFirstToken();
      if (token && sourceType) {
        const identifier = new TypedIdentifier(token, filename, sourceType, [IdentifierMeta.InlineDefinition]);
        scope.addIdentifier(identifier);
      } else if (token) {
        const message = "Move, could not determine type for \"" + token.getStr() + "\"";
        const identifier = new TypedIdentifier(token, filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
        scope.addIdentifier(identifier);
      }
    }
  }
}