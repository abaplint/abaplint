import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic/unknown_type";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {Target} from "../expressions/target";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Catch implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const names = new Set<string>();
    for (const c of node.findDirectExpressions(Expressions.ClassName)) {
      const token = c.getFirstToken();
      const className = token.getStr().toUpperCase();
      const found = input.scope.existsObject(className);
      if (found?.id) {
        input.scope.addReference(token, found.id, ReferenceType.ObjectOrientedReference, input.filename);
      } else if (input.scope.getDDIC().inErrorNamespace(className) === false) {
        const extra: IReferenceExtras = {ooName: className, ooType: "Void"};
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, extra);
      } else {
        const message = "CATCH, unknown class " + className;
        input.issues.push(syntaxIssue(input, token, message));
        return;
      }

      if (names.has(className)) {
        const message = "Duplicate class name in CATCH: " + className;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      names.add(className);
    }

    const target = node.findDirectExpression(Expressions.Target);
    const firstClassName = node.findDirectExpression(Expressions.ClassName)?.getFirstToken().getStr();

    if (target?.findDirectExpression(Expressions.InlineData)) {
      const token = target.findFirstExpression(Expressions.TargetField)?.getFirstToken();
      const found = input.scope.existsObject(firstClassName);
      if (token && firstClassName && found?.id) {
        const identifier = new TypedIdentifier(token, input.filename, new ObjectReferenceType(found.id), [IdentifierMeta.InlineDefinition]);
        input.scope.addIdentifier(identifier);
        input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
      } else if (token && input.scope.getDDIC().inErrorNamespace(firstClassName) === false) {
        const identifier = new TypedIdentifier(token, input.filename, VoidType.get(firstClassName), [IdentifierMeta.InlineDefinition]);
        input.scope.addIdentifier(identifier);
        input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
      } else if (token) {
        const message = "Catch, could not determine type for \"" + token.getStr() + "\"";
        const identifier = new TypedIdentifier(token, input.filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
        input.scope.addIdentifier(identifier);
        input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
      }
    } else if (target) {
      Target.runSyntax(target, input);
    }

  }
}