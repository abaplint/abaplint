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

export class NewObject {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, targetType: AbstractType | undefined, filename: string): AbstractType {
    let ret: AbstractType | undefined = undefined;

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
        /*
      } else {
        const extra: IReferenceExtras = {ooName: typeName, ooType: "Void"};
        scope.addReference(typeToken, undefined, ReferenceType.ObjectOrientedVoidReference, filename, extra);
        ret = new VoidType(typeName);
        */
      }
    }

    if (ret === undefined) {
      const type = scope.findType(typeName);
      if (type) {
        // todo: scope.addReference
        ret = new DataReference(type.getType());
      } else if (scope.getDDIC().inErrorNamespace(typeName) === false) {
        scope.addReference(typeToken, undefined, ReferenceType.VoidType, filename);
        ret = new VoidType(typeName);
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

    const def = scope.findObjectDefinition(obj.getIdentifier().getName());
    const helper = new ObjectOriented(scope);
    // eslint-disable-next-line prefer-const
    let {method} = helper.searchMethodName(def, "CONSTRUCTOR");

    const source = node.findDirectExpression(Expressions.Source);
    const parameters = node.findDirectExpression(Expressions.ParameterListS);
    if (source) {
      // single unnamed parameter
      const type = this.defaultImportingType(method);
      if (type === undefined) {
        throw new Error("NewObject, no default importing parameter found");
      }
      new Source().runSyntax(source, scope, filename, type);
    } else if (parameters) {
      // parameters with names
      if (method === undefined) {
        throw new Error("NewObject, no parameters for constructor found");
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