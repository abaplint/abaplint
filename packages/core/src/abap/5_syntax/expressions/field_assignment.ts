import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {DataReference, GenericObjectReferenceType, ObjectReferenceType, StructureType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {Source} from "./source";
import {TypeUtils} from "../_type_utils";

export class FieldAssignment {

  public static runSyntax(
    node: ExpressionNode | StatementNode,
    input: SyntaxInput,
    targetType: AbstractType | undefined): void {

    const fieldSub = node.findDirectExpression(Expressions.FieldSub);
    if (fieldSub === undefined) {
      const message = "FieldAssignment, FieldSub node not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const s = node.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      const message = "FieldAssignment, Source node not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    let type: AbstractType | undefined = undefined;
    if (targetType instanceof StructureType) {
      let context: AbstractType | undefined = targetType;
      for (const c of fieldSub.getChildren()) {
        const text = c.concatTokens();
        if (text !== "-" && context instanceof StructureType) {
          context = context.getComponentByName(text);
          if (context === undefined) {
            const message = `field ${text} does not exist in structure`;
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return;
          }
        }
      }
      type = context;
    } else if (targetType instanceof VoidType) {
      type = targetType;
    }

    const sourceType = Source.runSyntax(s, input, type);
    if (this.isReference(type)
        && !(type instanceof ObjectReferenceType && sourceType instanceof ObjectReferenceType)
        && new TypeUtils(input.scope).isAssignable(sourceType, type) === false) {
// a reference component only takes a reference, values like '' or 1 are not converted
      const message = `Type of source cannot be converted to the type of ${fieldSub.concatTokens()}`;
      input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
    }
  }

  private static isReference(type: AbstractType | undefined): boolean {
    return type instanceof ObjectReferenceType
      || type instanceof GenericObjectReferenceType
      || type instanceof DataReference;
  }

}