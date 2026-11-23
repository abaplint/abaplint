import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {Target} from "../expressions/target";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {TypeUtils} from "../_type_utils";
import {IClassDefinition} from "../../types/_class_definition";
import {AbstractType} from "../../types/basic/_abstract_type";

export class Catch implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const target = node.findDirectExpression(Expressions.Target);
    const inlineTarget = target?.findDirectExpression(Expressions.InlineData)
      ?.findFirstExpression(Expressions.TargetField)?.getFirstToken();
    if (inlineTarget && inlineTarget.getStr().length > 30) {
      input.issues.push(syntaxIssue(input, inlineTarget, "Inline exception name longer than 30 characters"));
    }

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
      }

      if (names.has(className)) {
        const message = "Duplicate class name in CATCH: " + className;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      names.add(className);
    }

    if (target?.findDirectExpression(Expressions.InlineData)) {
      const token = target.findFirstExpression(Expressions.TargetField)?.getFirstToken();
      if (token) {
        const classNames = Array.from(names);
        const unknownClass = classNames.find(name => input.scope.findClassDefinition(name) === undefined);
        const type = unknownClass === undefined
          ? this.inlineType(classNames, input)
          : VoidType.get(unknownClass);
        const identifier = new TypedIdentifier(token, input.filename, type, [IdentifierMeta.InlineDefinition]);
        input.scope.addIdentifier(identifier);
        input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
      }
    } else if (target) {
      const targetType = Target.runSyntax(target, input);
      if (targetType instanceof ObjectReferenceType) {
        for (const c of node.findDirectExpressions(Expressions.ClassName)) {
          const token = c.getFirstToken();
          const className = token.getStr().toUpperCase();
          const found = input.scope.existsObject(className);
          if (found?.id) {
            const catchType = new ObjectReferenceType(found.id);
            if (new TypeUtils(input.scope).isAssignableStrict(catchType, targetType) === false) {
              const message = "CATCH target not compatible with " + className;
              input.issues.push(syntaxIssue(input, token, message));
              return;
            }
          }
        }
      }
    }

  }

  // static type of an inline target: the first class, replaced by each following class that is one of its
  // super classes; any other following class makes it CX_ROOT, also when the classes share a closer super class
  private inlineType(classNames: readonly string[], input: SyntaxInput): AbstractType {
    let current = input.scope.findClassDefinition(classNames[0]);
    for (const name of classNames.slice(1)) {
      if (current === undefined) {
        break;
      }
      const next = input.scope.findClassDefinition(name);
      current = next && this.isSuperClass(next, current, input) ? next : undefined;
    }

    if (current !== undefined) {
      return new ObjectReferenceType(current);
    }
    const root = input.scope.findClassDefinition("CX_ROOT");
    return root ? new ObjectReferenceType(root) : VoidType.get("CX_ROOT");
  }

  private isSuperClass(candidate: IClassDefinition, cls: IClassDefinition, input: SyntaxInput): boolean {
    const name = candidate.getName().toUpperCase();
    const visited = new Set<string>();
    let current: IClassDefinition | undefined = cls;
    while (current && visited.has(current.getName().toUpperCase()) === false) {
      if (current.getName().toUpperCase() === name) {
        return true;
      }
      visited.add(current.getName().toUpperCase());
      current = input.scope.findClassDefinition(current.getSuperClass());
    }
    return false;
  }
}
