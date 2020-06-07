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

export class MethodCallChain {
  public runSyntax(
    node: ExpressionNode,
    scope: CurrentScope,
    _filename: string,
    targetType?: AbstractType): AbstractType | undefined {

    const helper = new ObjectOriented(scope);
    const children = node.getChildren().slice();

    const first = children.shift();
    if (first === undefined) {
      throw new Error("MethodCallChain, first child expected");
    }

    let context: AbstractType | undefined = this.findTop(first, scope, targetType);
    if (first.get() instanceof Expressions.MethodCall) {
      children.unshift(first);
    }

    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }
      if (context instanceof VoidType) {
        continue;
      }

      if (current instanceof ExpressionNode && current.get() instanceof Expressions.MethodCall) {
        // for built-in methods set className to undefined
        const className = context instanceof ObjectReferenceType ? context.getName() : undefined;
        const methodName = current.findDirectExpression(Expressions.MethodName)?.getFirstToken().getStr();
        const method = helper.searchMethodName(scope.findObjectDefinition(className), methodName);
        if (method === undefined) {
          const builtin = new BuiltIn().getMethods().find(a => a.name === methodName?.toUpperCase());
          if (builtin) {
            context = builtin.returnType;
            continue;
          }
        }
        if (method === undefined && methodName?.toUpperCase() === "CONSTRUCTOR") {
          context = undefined; // todo, this is a workaround, constructors always exists
        } else if (method === undefined) {
          throw new Error("Method \"" + methodName + "\" not found");
        } else {
          const ret = method.getParameters().getReturning()?.getType();
          context = ret;
        }
      }
    }

    return context;
  }

//////////////////////////////////////

  private findTop(first: INode, scope: CurrentScope, targetType: AbstractType | undefined): AbstractType | undefined {
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
      return new NewObject().runSyntax(first, scope, targetType);
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