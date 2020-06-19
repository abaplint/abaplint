import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {TypeNameOrInfer} from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";

export class NewObject {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, targetType: AbstractType | undefined, filename: string): AbstractType  {
    const typeToken = node.findDirectExpression(TypeNameOrInfer)?.getFirstToken();
    const typeName = typeToken?.getStr();
    if (typeName === undefined) {
      throw new Error("NewObject, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType) {
      return targetType;
    } else if (typeName === "#") {
      throw new Error("NewObject, todo, infer type");
    }

    const found = scope.findObjectDefinition(typeName);
    if (found === undefined && scope.getDDIC().inErrorNamespace(typeName) === false) {
      return new VoidType(typeName);
    } else if (found === undefined) {
      throw new Error("Type \"" + typeName + "\" not found in scope, NewObject");
    }

    scope.addReference(typeToken, found, ReferenceType.ClassReference, filename);

    return new ObjectReferenceType(typeName);
  }
}