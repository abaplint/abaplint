import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType, ObjectReferenceType} from "../../types/basic";
import {FieldChain} from "./field_chain";
import {INode} from "../../nodes/_inode";
import {ObjectOriented} from "../_object_oriented";
import {NewObject} from "./new_object";
import {Cast} from "./cast";
import {BuiltIn} from "../_builtin";
import {MethodCallParam} from "./method_call_param";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {ComponentName} from "./component_name";
import {AttributeName} from "./attribute_name";
import {ClassDefinition} from "../../types/class_definition";

export class MethodCallChain {
  public runSyntax(
    node: ExpressionNode,
    scope: CurrentScope,
    filename: string,
    targetType?: AbstractType): AbstractType | undefined {

    const helper = new ObjectOriented(scope);
    const children = node.getChildren().slice();

    const first = children.shift();
    if (first === undefined) {
      throw new Error("MethodCallChain, first child expected");
    }

    let context: AbstractType | undefined = this.findTop(first, scope, targetType, filename);
    if (first.get() instanceof Expressions.MethodCall) {
      children.unshift(first);
    }

    let previous = "";
    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current instanceof ExpressionNode && current.get() instanceof Expressions.MethodCall) {
        // for built-in methods set className to undefined
        const className = context instanceof ObjectReferenceType ? context.getIdentifierName() : undefined;
        const methodToken = current.findDirectExpression(Expressions.MethodName)?.getFirstToken();
        const methodName = methodToken?.getStr();
        const def = scope.findObjectDefinition(className);
        // eslint-disable-next-line prefer-const
        let {method, def: foundDef} = helper.searchMethodName(def, methodName);
        if (method === undefined && current === first) {
          method = new BuiltIn().searchBuiltin(methodName?.toUpperCase());
          if (method) {
            scope.addReference(methodToken, method, ReferenceType.BuiltinMethodReference, filename);
          }
        } else {
          if (previous === "=>" && method?.isStatic() === false) {
            throw new Error("Method \"" + methodName + "\" not static");
          }
          const extra: IReferenceExtras = {
            ooName: foundDef?.getName(),
            ooType: foundDef instanceof ClassDefinition ? "CLAS" : "INTF"};
          scope.addReference(methodToken, method, ReferenceType.MethodReference, filename, extra);
        }
        if (methodName?.includes("~")) {
          const name = methodName.split("~")[0];
          const idef = scope.findInterfaceDefinition(name);
          if (idef) {
            scope.addReference(methodToken, idef, ReferenceType.ObjectOrientedReference, filename);
          }
        }

        if (method === undefined && methodName?.toUpperCase() === "CONSTRUCTOR") {
          context = undefined; // todo, this is a workaround, constructors always exists
        } else if (method === undefined && !(context instanceof VoidType)) {
          throw new Error("Method \"" + methodName + "\" not found, methodCallChain");
        } else if (method) {
          const ret = method.getParameters().getReturning()?.getType();
          context = ret;
        }

        const param = current.findDirectExpression(Expressions.MethodCallParam);
        if (param && method) {
          new MethodCallParam().runSyntax(param, scope, method, filename);
        } else if (param && context instanceof VoidType) {
          new MethodCallParam().runSyntax(param, scope, context, filename);
        }
      } else if (current instanceof ExpressionNode && current.get() instanceof Expressions.ComponentName) {
        context = new ComponentName().runSyntax(context, current);
      } else if (current instanceof ExpressionNode && current.get() instanceof Expressions.AttributeName) {
        context = new AttributeName().runSyntax(context, current, scope, filename);
      }

      previous = current.concatTokens();
    }

    return context;
  }

//////////////////////////////////////

  private findTop(first: INode, scope: CurrentScope, targetType: AbstractType | undefined, filename: string): AbstractType | undefined {
    if (first.get() instanceof Expressions.ClassName) {
      const token = first.getFirstToken();
      const className = token.getStr();
      const classDefinition = scope.findObjectDefinition(className);
      if (classDefinition === undefined && scope.getDDIC().inErrorNamespace(className) === false) {
        const extra: IReferenceExtras = {ooName: className, ooType: "Void"};
        scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, filename, extra);
        return new VoidType(className);
      } else if (classDefinition === undefined) {
        throw new Error("Class " + className + " not found");
      }
      scope.addReference(first.getFirstToken(), classDefinition, ReferenceType.ObjectOrientedReference, filename);
      return new ObjectReferenceType(classDefinition);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.FieldChain) {
      return new FieldChain().runSyntax(first, scope, filename, ReferenceType.DataReadReference);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.NewObject) {
      return new NewObject().runSyntax(first, scope, targetType, filename);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.Cast) {
      return new Cast().runSyntax(first, scope, targetType, filename);
    } else {
      const meType = scope.findVariable("me")?.getType();
      if (meType) {
        return meType;
      }
    }
    return undefined;
  }

}