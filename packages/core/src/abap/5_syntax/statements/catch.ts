import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic/unknown_type";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {Target} from "../expressions/target";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {CurrentScope} from "../_current_scope";

function getAncestors(className: string, scope: CurrentScope): string[] {
  const ancestors: string[] = [className.toUpperCase()];
  let current = className.toUpperCase();
  const visited = new Set<string>([current]);
  while (true) {
    const classDef = scope.findClassDefinition(current);
    if (!classDef) {
      break;
    }
    const superClass = classDef.getSuperClass();
    if (!superClass) {
      break;
    }
    const superUpper = superClass.toUpperCase();
    if (visited.has(superUpper)) {
      break;
    }
    visited.add(superUpper);
    ancestors.push(superUpper);
    current = superUpper;
  }
  return ancestors;
}

function findCommonSuperClass(classNames: string[], scope: CurrentScope): string | undefined {
  if (classNames.length === 0) {
    return undefined;
  }
  if (classNames.length === 1) {
    return classNames[0].toUpperCase();
  }
  const allAncestors = classNames.map(name => getAncestors(name, scope));
  for (const ancestor of allAncestors[0]) {
    if (allAncestors.slice(1).every(list => list.includes(ancestor))) {
      return ancestor;
    }
  }
  return undefined;
}

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

    if (target?.findDirectExpression(Expressions.InlineData)) {
      const token = target.findFirstExpression(Expressions.TargetField)?.getFirstToken();
      if (token) {
        const classNames = node.findDirectExpressions(Expressions.ClassName).map(e => e.getFirstToken().getStr().toUpperCase());
        const anyVoid = classNames.some(cn => !input.scope.existsObject(cn)?.id);
        if (anyVoid) {
          const voidName = classNames.find(cn => !input.scope.existsObject(cn)?.id) ?? classNames[0];
          const identifier = new TypedIdentifier(token, input.filename, VoidType.get(voidName), [IdentifierMeta.InlineDefinition]);
          input.scope.addIdentifier(identifier);
          input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
        } else {
          const commonClassName = findCommonSuperClass(classNames, input.scope);
          const found = commonClassName ? input.scope.existsObject(commonClassName) : undefined;
          if (found?.id) {
            const identifier = new TypedIdentifier(token, input.filename, new ObjectReferenceType(found.id), [IdentifierMeta.InlineDefinition]);
            input.scope.addIdentifier(identifier);
            input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
          } else {
            const message = "Catch, could not determine type for \"" + token.getStr() + "\"";
            const identifier = new TypedIdentifier(token, input.filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
            input.scope.addIdentifier(identifier);
            input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
          }
        }
      }
    } else if (target) {
      Target.runSyntax(target, input);
    }

  }
}