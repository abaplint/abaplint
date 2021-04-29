import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic/unknown_type";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {Target} from "../expressions/target";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";

export class Catch implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const c of node.findDirectExpressions(Expressions.ClassName)) {
      const token = c.getFirstToken();
      const className = token.getStr();
      const found = scope.existsObject(className);
      if (found.found === true && found.id) {
        scope.addReference(token, found.id, found.type, filename);
      } else if (scope.getDDIC().inErrorNamespace(className) === false) {
        const extra: IReferenceExtras = {ooName: className, ooType: "Void"};
        scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, filename, extra);
      } else {
        throw new Error("CATCH, unknown class " + className);
      }
    }

    const target = node.findDirectExpression(Expressions.Target);
    const firstClassName = node.findDirectExpression(Expressions.ClassName)?.getFirstToken().getStr();

    if (target?.findDirectExpression(Expressions.InlineData)) {
      const token = target.findFirstExpression(Expressions.TargetField)?.getFirstToken();
      const found = scope.existsObject(firstClassName);
      if (token && found.found === true && firstClassName && found.id) {
        const identifier = new TypedIdentifier(token, filename, new ObjectReferenceType(found.id), [IdentifierMeta.InlineDefinition]);
        scope.addIdentifier(identifier);
        scope.addReference(token, identifier, ReferenceType.DataWriteReference, filename);
      } else if (token && scope.getDDIC().inErrorNamespace(firstClassName) === false) {
        const identifier = new TypedIdentifier(token, filename, new VoidType(firstClassName), [IdentifierMeta.InlineDefinition]);
        scope.addIdentifier(identifier);
        scope.addReference(token, identifier, ReferenceType.DataWriteReference, filename);
      } else if (token) {
        const message = "Catch, could not determine type for \"" + token.getStr() + "\"";
        const identifier = new TypedIdentifier(token, filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
        scope.addIdentifier(identifier);
        scope.addReference(token, identifier, ReferenceType.DataWriteReference, filename);
      }
    } else if (target) {
      new Target().runSyntax(target, scope, filename);
    }

  }
}