import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Source} from "./source";
import {TypeUtils} from "../_type_utils";

export class Cast {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, targetType: AbstractType | undefined, filename: string): AbstractType {
    const sourceNode = node.findDirectExpression(Expressions.Source);
    if (sourceNode === undefined) {
      throw new Error("Cast, source node not found");
    }

    const sourceType = new Source().runSyntax(sourceNode, scope, filename);
    let tt: AbstractType | undefined = undefined;

    const typeName = node.findDirectExpression(Expressions.TypeNameOrInfer)?.getFirstToken().getStr();
    if (typeName === undefined) {
      throw new Error("Cast, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType) {
      tt = targetType;
    } else if (typeName === "#") {
      throw new Error("Cast, todo, infer type");
    }

    if (tt === undefined) {
      const found = scope.findObjectDefinition(typeName);
      if (found === undefined && scope.getDDIC().inErrorNamespace(typeName) === false) {
        tt = new VoidType(typeName);
      } else if (found === undefined) {
// todo, this should be an UnknownType instead?
        throw new Error("Type \"" + typeName + "\" not found in scope, Cast");
      } else {
        tt = new ObjectReferenceType(found);
      }
    }
    new Source().addIfInferred(node, scope, filename, tt);

    if (new TypeUtils(scope).isCastable(sourceType, tt) === false) {
      throw new Error("Cast, incompatible types");
    }

    return tt;
  }
}