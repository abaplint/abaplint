import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {TypeNameOrInfer} from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";

export class NewObject {
  public runSyntax(node: ExpressionNode, scope: CurrentScope): AbstractType  {
    const typeName = node.findDirectExpression(TypeNameOrInfer)?.getFirstToken().getStr();
    if (typeName === undefined) {
      throw new Error("NewObject, child TypeNameOrInfer not found");
    } else if (typeName === "#") {
      throw new Error("NewObject, todo, infer type");
    }

    const found = scope.findObjectDefinition(typeName);
    if (found === undefined && scope.getDDIC().inErrorNamespace(typeName) === false) {
      return new VoidType(typeName);
    } else if (found === undefined) {
      throw new Error("Type \"" + typeName + "\" not found in scope, NewObject");
    }

    return new ObjectReferenceType(typeName);
  }
}