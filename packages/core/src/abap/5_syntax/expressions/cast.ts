import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {TypeNameOrInfer} from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";

export class Cast {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, targetType: AbstractType | undefined): AbstractType {
    const typeName = node.findDirectExpression(TypeNameOrInfer)?.getFirstToken().getStr();
    if (typeName === undefined) {
      throw new Error("Cast, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType) {
      return targetType;
    } else if (typeName === "#") {
      throw new Error("Cast, todo, infer type");
    }

    const found = scope.findObjectDefinition(typeName);
    if (found === undefined && scope.getDDIC().inErrorNamespace(typeName) === false) {
      return new VoidType(typeName);
    } else if (found === undefined) {
      throw new Error("Type \"" + typeName + "\" not found in scope, Cast");
    }

    return new ObjectReferenceType(found);
  }
}