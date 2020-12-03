import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ObjectReferenceType, VoidType, DataReference} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {Source} from "./source";

export class NewObject {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, targetType: AbstractType | undefined, filename: string): AbstractType {
    let ret: AbstractType | undefined = undefined;

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    const typeToken = node.findDirectExpression(Expressions.TypeNameOrInfer)?.getFirstToken();
    const typeName = typeToken?.getStr();
    if (typeName === undefined) {
      throw new Error("NewObject, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType && targetType instanceof ObjectReferenceType) {
      scope.addReference(typeToken, targetType.getIdentifier(), ReferenceType.InferredType, filename);
      ret = targetType;
    } else if (typeName === "#" && targetType) {
      ret = targetType;
    } else if (typeName === "#") {
      throw new Error("NewObject, todo, infer type");
    }

    if (ret === undefined) {
      const objDefinition = scope.findObjectDefinition(typeName);
      if (objDefinition) {
        scope.addReference(typeToken, objDefinition, ReferenceType.ObjectOrientedReference, filename);
        ret = new ObjectReferenceType(objDefinition);
      } else {
        const extra: IReferenceExtras = {ooName: typeName, ooType: "Void"};
        scope.addReference(typeToken, undefined, ReferenceType.ObjectOrientedVoidReference, filename, extra);
      }
    }

    if (ret === undefined) {
      const type = scope.findType(typeName);
      if (type) {
        // todo: scope.addReference
        ret = new DataReference(type.getType());
      } else if (scope.getDDIC().inErrorNamespace(typeName) === false) {
        ret = new VoidType(typeName);
      } else {
        throw new Error("Type \"" + typeName + "\" not found in scope, NewObject");
      }
    }

    return ret;
  }

}