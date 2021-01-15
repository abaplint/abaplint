import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ObjectReferenceType, VoidType, DataReference} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";
import {Source} from "./source";
import {ObjectOriented} from "../_object_oriented";
import {IMethodDefinition} from "../../types/_method_definition";
import {MethodParameters} from "./method_parameters";
import {BasicTypes} from "../basic_types";

export class NewObject {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, targetType: AbstractType | undefined, filename: string): AbstractType {
    let ret: AbstractType | undefined = undefined;

    const typeExpr = node.findDirectExpression(Expressions.TypeNameOrInfer);
    const typeToken = typeExpr?.getFirstToken();
    const typeName = typeExpr?.concatTokens();
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
      }
    }

    if (ret === undefined) {
      const basic = new BasicTypes(filename, scope);
      const type = basic.resolveTypeName(typeExpr);
      if (type && !(type instanceof VoidType)) {
        ret = new DataReference(type);
      } else if (type instanceof VoidType) {
        ret = type;
      } else {
        throw new Error("Type \"" + typeName + "\" not found in scope, NewObject");
      }
    }

    if (ret instanceof ObjectReferenceType) {
      this.parameters(node, ret, scope, filename);
    } else {
      for (const s of node.findAllExpressions(Expressions.Source)) {
        new Source().runSyntax(s, scope, filename, ret);
      }
    }

    return ret;
  }

  private parameters(node: ExpressionNode, obj: ObjectReferenceType, scope: CurrentScope, filename: string) {

    const name = obj.getIdentifier().getName();
    const def = scope.findObjectDefinition(name);
    const helper = new ObjectOriented(scope);
    // eslint-disable-next-line prefer-const
    let {method} = helper.searchMethodName(def, "CONSTRUCTOR");

    const source = node.findDirectExpression(Expressions.Source);
    const parameters = node.findDirectExpression(Expressions.ParameterListS);
    if (source) {
      // single unnamed parameter
      const type = this.defaultImportingType(method);
      if (type === undefined) {
        throw new Error("NewObject, no default importing parameter found for constructor, " + name);
      }
      new Source().runSyntax(source, scope, filename, type);
    } else if (parameters) {
      // parameters with names
      if (method === undefined) {
        throw new Error("NewObject, no parameters for constructor found, " + name);
      }
      new MethodParameters().checkExporting(parameters, scope, method, filename);
    }
    // else: no paramters, and the constructor always exist
  }

  private defaultImportingType(method: IMethodDefinition | undefined) {
    let targetType: AbstractType | undefined = undefined;
    if (method === undefined) {
      return undefined;
    }
    const name = method.getParameters().getDefaultImporting();
    for (const i of method.getParameters().getImporting()) {
      if (i.getName().toUpperCase() === name) {
        targetType = i.getType();
      }
    }
    return targetType;
  }

}