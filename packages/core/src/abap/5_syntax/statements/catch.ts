import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic/unknown_type";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {Target} from "../expressions/target";

export class Catch {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const target = node.findDirectExpression(Expressions.Target);
    const className = node.findDirectExpression(Expressions.Field)?.getFirstToken().getStr();

    if (target?.findDirectExpression(Expressions.InlineData)) {
      const token = target.findFirstExpression(Expressions.TargetField)?.getFirstToken();
      const found = scope.existsObject(className);
      if (token && found.found === true && className && found.id) {
        const identifier = new TypedIdentifier(token, filename, new ObjectReferenceType(found.id), [IdentifierMeta.InlineDefinition]);
        scope.addIdentifier(identifier);
      } else if (token && scope.getDDIC().inErrorNamespace(className) === false) {
        const identifier = new TypedIdentifier(token, filename, new VoidType(className), [IdentifierMeta.InlineDefinition]);
        scope.addIdentifier(identifier);
      } else if (token) {
        const message = "Catch, could not determine type for \"" + token.getStr() + "\"";
        const identifier = new TypedIdentifier(token, filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
        scope.addIdentifier(identifier);
      }
    } else if (target) {
      new Target().runSyntax(target, scope, filename);
    }

  }
}