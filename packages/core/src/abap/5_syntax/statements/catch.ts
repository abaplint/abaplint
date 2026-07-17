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
        const classNames = Array.from(names);
        const unknownClass = classNames.find(name => input.scope.findClassDefinition(name) === undefined);
        const commonSuperclass = unknownClass === undefined
          ? this.findCommonSuperclass(classNames, input)
          : undefined;
        const type = commonSuperclass
          ? new ObjectReferenceType(commonSuperclass)
          : VoidType.get(unknownClass || classNames.join(" "));
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

  private findCommonSuperclass(classNames: readonly string[], input: SyntaxInput): IClassDefinition | undefined {
    const lineages: IClassDefinition[][] = [];
    for (const className of classNames) {
      const lineage: IClassDefinition[] = [];
      let current = input.scope.findClassDefinition(className);
      const visited = new Set<string>();
      while (current && visited.has(current.getName().toUpperCase()) === false) {
        lineage.push(current);
        visited.add(current.getName().toUpperCase());
        current = input.scope.findClassDefinition(current.getSuperClass());
      }
      lineages.push(lineage);
    }

    return lineages[0]?.find(candidate => lineages.every(lineage =>
      lineage.some(item => item.getName().toUpperCase() === candidate.getName().toUpperCase())));
  }
}
