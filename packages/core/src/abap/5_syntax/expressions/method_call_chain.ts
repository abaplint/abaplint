import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {INode} from "../../..";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType, ObjectReferenceType} from "../../types/basic";
import {FieldChain} from "./field_chain";

export class MethodCallChain {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, _filename: string): void {

    const children = node.getChildren().slice();

    const first = children.shift();
    if (first === undefined) {
      throw new Error("MethodCallChain, first child expected");
    }

    const context: AbstractType = this.findTop(first, scope);

    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }
      if (context instanceof VoidType) {
        continue;
      }

      if (current instanceof ExpressionNode && current.get() instanceof Expressions.MethodCall) {
        if (!(context instanceof ObjectReferenceType)) {
          throw new Error("Not a object reference");
        }

        const methodName = current.findDirectExpression(Expressions.MethodName)?.getFirstToken().getStr();
        const method = scope.findClassDefinition(context.getName())?.getMethodDefinitions().getByName(methodName);

        if (method === undefined) {
          throw new Error("Method \"" + methodName + "\" not found");
        }
      }
    }

  }

//////////////////////////////////////

  private findTop(first: INode, scope: CurrentScope): AbstractType {
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
    } else if (first.get() instanceof Expressions.NewObject) {
      throw new Error("MethodCallChain, todo, NewObject");
    } else if (first.get() instanceof Expressions.Cast) {
      throw new Error("MethodCallChain, todo, Cast");
    } else {
      const meType = scope.findVariable("me")?.getType();
      if (meType) {
        return meType;
      }
      throw new Error("Method call outside class");
    }
  }

}