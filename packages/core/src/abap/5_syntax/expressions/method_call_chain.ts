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
import {ReferenceType} from "../_reference";

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

    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current instanceof ExpressionNode && current.get() instanceof Expressions.MethodCall) {
        // for built-in methods set className to undefined
        const className = context instanceof ObjectReferenceType ? context.getName() : undefined;
        const methodToken = current.findDirectExpression(Expressions.MethodName)?.getFirstToken();
        const methodName = methodToken?.getStr();
        let method = helper.searchMethodName(scope.findObjectDefinition(className), methodName);
        if (method === undefined) {
          method = new BuiltIn().searchBuiltin(methodName?.toUpperCase());
        }
        if (method === undefined && methodName?.toUpperCase() === "CONSTRUCTOR") {
          context = undefined; // todo, this is a workaround, constructors always exists
        } else if (method === undefined && !(context instanceof VoidType)) {
          throw new Error("Method \"" + methodName + "\" not found");
        } else if (method) {
          scope.addReference(methodToken, method, ReferenceType.MethodReference, filename, {className: className});

          const ret = method.getParameters().getReturning()?.getType();
          context = ret;
        }

        const param = current.findDirectExpression(Expressions.MethodCallParam);
        if (param && method) {
          new MethodCallParam().runSyntax(param, scope, method, filename);
        } else if (param && context instanceof VoidType) {
          new MethodCallParam().runSyntax(param, scope, context, filename);
        }

      }
    }

    return context;
  }

//////////////////////////////////////

  private findTop(first: INode, scope: CurrentScope, targetType: AbstractType | undefined, filename: string): AbstractType | undefined {
    if (first.get() instanceof Expressions.ClassName) {
      const className = first.getFirstToken().getStr();
      const classDefinition = scope.findObjectDefinition(className);
      if (classDefinition === undefined && scope.getDDIC().inErrorNamespace(className) === false) {
        return new VoidType(className);
      } else if (classDefinition === undefined) {
        throw new Error("Class " + className + " not found");
      }
      return new ObjectReferenceType(className);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.FieldChain) {
      return new FieldChain().runSyntax(first, scope);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.NewObject) {
      return new NewObject().runSyntax(first, scope, targetType, filename);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.Cast) {
      return new Cast().runSyntax(first, scope, targetType);
    } else {
      const meType = scope.findVariable("me")?.getType();
      if (meType) {
        return meType;
      }
    }
    return undefined;
  }

}