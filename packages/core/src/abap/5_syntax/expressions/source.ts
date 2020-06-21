import {ExpressionNode, TokenNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {MethodCallChain} from "./method_call_chain";
import {UnknownType} from "../../types/basic/unknown_type";
import {FieldChain} from "./field_chain";
import {StringType, VoidType} from "../../types/basic";
import {Constant} from "./constant";
import {BasicTypes} from "../basic_types";

export class Source {
  public runSyntax(
    node: ExpressionNode,
    scope: CurrentScope,
    filename: string,
    targetType?: AbstractType): AbstractType | undefined {

    const children = node.getChildren().slice();
    const first = children.shift();

    if (first instanceof TokenNode) {
      const tok = first.getFirstToken().getStr().toUpperCase();
      switch (tok) {
        case "VALUE":
          return this.value(node, scope, filename, targetType);
        case "CONV":
          return this.value(node, scope, filename, targetType);
        default:
          return new UnknownType("todo, Source type " + tok);
      }
    } else if (first === undefined || !(first instanceof ExpressionNode)) {
      return undefined;
    }

    if (first.get() instanceof Expressions.MethodCallChain) {
      return new MethodCallChain().runSyntax(first, scope, filename, targetType);
    } else if (first.get() instanceof Expressions.FieldChain) {
      return new FieldChain().runSyntax(first, scope, filename);
    } else if (first.get() instanceof Expressions.StringTemplate) {
      return new StringType();
    } else if (first.get() instanceof Expressions.Constant) {
      return new Constant().runSyntax(first);
    }

    return new UnknownType("todo, Source type");
  }

////////////////////////////////

  private value(node: ExpressionNode,
                scope: CurrentScope,
                filename: string,
                targetType: AbstractType | undefined): AbstractType | undefined {

    const typeExpression = node.findFirstExpression(Expressions.TypeNameOrInfer);
    const typeName = typeExpression?.getFirstToken().getStr();
    if (typeName === undefined) {
      throw new Error("VALUE, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType) {
      return targetType;
    } else if (typeName === "#") {
      return new VoidType("VALUE_todo");
//      throw new Error("VALUE, todo, infer type");
    } else if (!(typeExpression instanceof ExpressionNode)) {
      throw new Error("VALUE, expression node expected");
    }

    const found = new BasicTypes(filename, scope).parseType(typeExpression);
    if (found === undefined && scope.getDDIC().inErrorNamespace(typeName) === false) {
      return new VoidType(typeName);
    } else if (found === undefined) {
      throw new Error("Type \"" + typeName + "\" not found in scope, VALUE");
    }
    return found;

  }

}