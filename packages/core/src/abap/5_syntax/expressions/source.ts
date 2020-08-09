import {ExpressionNode, TokenNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {MethodCallChain} from "./method_call_chain";
import {UnknownType} from "../../types/basic/unknown_type";
import {FieldChain} from "./field_chain";
import {VoidType, StringType, CharacterType} from "../../types/basic";
import {Constant} from "./constant";
import {BasicTypes} from "../basic_types";
import {ComponentChain} from "./component_chain";
import {StringTemplate} from "./string_template";
import {ValueBody} from "./value_body";
import {Cond} from "./cond";
import {ReduceBody} from "./reduce_body";
import {ReferenceType} from "../_reference";

export class Source {
  public runSyntax(
    node: ExpressionNode,
    scope: CurrentScope,
    filename: string,
    targetType?: AbstractType): AbstractType | undefined {

    const children = node.getChildren().slice();
    let first = children.shift();

    if (first instanceof TokenNode) {
      const tok = first.getFirstToken().getStr().toUpperCase();
      switch (tok) {
        case "(":
        case "-":
          break;
        case "BOOLC":
          new Cond().runSyntax(node.findDirectExpression(Expressions.Cond), scope, filename);
          return new StringType();
        case "XSDBOOL":
          new Cond().runSyntax(node.findDirectExpression(Expressions.Cond), scope, filename);
          return new CharacterType(1);
        case "REDUCE":
        {
          const bodyType = new ReduceBody().runSyntax(node.findDirectExpression(Expressions.ReduceBody), scope, filename);
          return this.value(node, scope, filename, targetType, bodyType);
        }
        case "COND":
        case "CONV":
        case "CORRESPONDING":
        case "EXACT":
        case "SWITCH":
          return this.value(node, scope, filename, targetType, undefined);
        case "VALUE":
        {
          const bodyType = new ValueBody().runSyntax(node.findDirectExpression(Expressions.ValueBody), scope, filename);
          return this.value(node, scope, filename, targetType, bodyType);
        }
        default:
          return new UnknownType("todo, Source type " + tok);
      }
    } else if (first === undefined || !(first instanceof ExpressionNode)) {
      return undefined;
    }

    let context: AbstractType | undefined = new UnknownType("todo, Source type");

    while (children.length >= 0) {
      if (first instanceof ExpressionNode && first.get() instanceof Expressions.MethodCallChain) {
        context = new MethodCallChain().runSyntax(first, scope, filename, targetType);
      } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.FieldChain) {
        context = new FieldChain().runSyntax(first, scope, filename, ReferenceType.DataReadReference);
      } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.StringTemplate) {
        context = new StringTemplate().runSyntax(first, scope, filename);
      } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.Source) {
        context = new Source().runSyntax(first, scope, filename);
      } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.Constant) {
        context = new Constant().runSyntax(first);
      } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.ArrowOrDash) {
//        console.dir("dash");
      } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.ComponentChain) {
        context = new ComponentChain().runSyntax(context, first);
      }
      first = children.shift();
      if (first === undefined) {
        break;
      }
    }


    return context;
  }

////////////////////////////////

  private value(node: ExpressionNode,
                scope: CurrentScope,
                filename: string,
                targetType: AbstractType | undefined,
                bodyType: AbstractType | undefined): AbstractType | undefined {

    const typeExpression = node.findFirstExpression(Expressions.TypeNameOrInfer);
    const typeName = typeExpression?.getFirstToken().getStr();
    if (typeName === undefined) {
      throw new Error("VALUE, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType) {
      return targetType;
    } else if (typeName === "#" && bodyType) {
      return bodyType;
    } else if (typeName === "#") {
      return new VoidType("VALUE_todo");
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