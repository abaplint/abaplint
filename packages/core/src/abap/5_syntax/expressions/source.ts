import {ExpressionNode, TokenNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {MethodCallChain} from "./method_call_chain";
import {UnknownType} from "../../types/basic/unknown_type";
import {FieldChain} from "./field_chain";
import {VoidType, StringType, CharacterType, DataReference} from "../../types/basic";
import {Constant} from "./constant";
import {BasicTypes} from "../basic_types";
import {ComponentChain} from "./component_chain";
import {StringTemplate} from "./string_template";
import {ValueBody} from "./value_body";
import {Cond} from "./cond";
import {ReduceBody} from "./reduce_body";
import {ReferenceType} from "../_reference";
import {SwitchBody} from "./switch_body";
import {CondBody} from "./cond_body";
import {ConvBody} from "./conv_body";
import {AttributeName} from "./attribute_name";
import {FilterBody} from "./filter_body";
import {CorrespondingBody} from "./corresponding_body";
import {BuiltIn} from "../_builtin";

/*
* Type interference, valid scenarios:
* typed = VALUE #( ... ).         right hand side must follow left hand type
* DATA(bar) = VALUE type( ... ).  left gets the type of rigthand
* typed = VALUE type( ... ).      types must match and be compatible???
************* ERRORS *********
* VALUE #( ... ).                 syntax error
* DATA(bar) = VALUE #( ... ).     give error, no type can be derived
*/

export class Source {
  public runSyntax(
    node: ExpressionNode | undefined,
    scope: CurrentScope,
    filename: string,
    targetType?: AbstractType): AbstractType | undefined {

    if (node === undefined) {
      return undefined;
    }

    const children = node.getChildren().slice();
    let first = children.shift();

    if (first instanceof TokenNode) {
      const token = first.getFirstToken();
      const tok = token.getStr().toUpperCase();
      switch (tok) {
        case "(":
        case "-":
          break;
        case "BOOLC":
        {
          const method = new BuiltIn().searchBuiltin(tok);
          scope.addReference(token, method, ReferenceType.BuiltinMethodReference, filename);
          new Cond().runSyntax(node.findDirectExpression(Expressions.Cond), scope, filename);
          return new StringType();
        }
        case "XSDBOOL":
        {
          const method = new BuiltIn().searchBuiltin(tok);
          scope.addReference(token, method, ReferenceType.BuiltinMethodReference, filename);
          new Cond().runSyntax(node.findDirectExpression(Expressions.Cond), scope, filename);
          return new CharacterType(1);
        }
        case "REDUCE":
        {
          const foundType = this.determineType(node, scope, filename, targetType);
          const bodyType = new ReduceBody().runSyntax(node.findDirectExpression(Expressions.ReduceBody), scope, filename);
          return foundType ? foundType : bodyType;
        }
        case "SWITCH":
        {
          const foundType = this.determineType(node, scope, filename, targetType);
          new SwitchBody().runSyntax(node.findDirectExpression(Expressions.SwitchBody), scope, filename);
          return foundType;
        }
        case "COND":
        {
          const foundType = this.determineType(node, scope, filename, targetType);
          return new CondBody().runSyntax(node.findDirectExpression(Expressions.CondBody), scope, filename, foundType);
        }
        case "CONV":
        {
          const foundType = this.determineType(node, scope, filename, targetType);
          new ConvBody().runSyntax(node.findDirectExpression(Expressions.ConvBody), scope, filename);
          return foundType;
        }
        case "REF":
        {
          const foundType = this.determineType(node, scope, filename, targetType);
          const s = new Source().runSyntax(node.findDirectExpression(Expressions.Source), scope, filename);
          if (foundType === undefined && s) {
            return new DataReference(s);
          } else {
            return foundType;
          }
        }
        case "FILTER":
        {
          const foundType = this.determineType(node, scope, filename, targetType);
          return new FilterBody().runSyntax(node.findDirectExpression(Expressions.FilterBody), scope, filename, foundType);
        }
        case "CORRESPONDING":
        {
          const foundType = this.determineType(node, scope, filename, targetType);
          return new CorrespondingBody().runSyntax(node.findDirectExpression(Expressions.CorrespondingBody), scope, filename, foundType);
        }
        case "EXACT":
          return this.determineType(node, scope, filename, targetType);
        case "VALUE":
        {
          const foundType = this.determineType(node, scope, filename, targetType);
          return new ValueBody().runSyntax(node.findDirectExpression(Expressions.ValueBody), scope, filename, foundType);
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
      } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.AttributeName) {
        context = new AttributeName().runSyntax(context, first, scope, filename, ReferenceType.DataReadReference);
      }
      first = children.shift();
      if (first === undefined) {
        break;
      }
    }


    return context;
  }

////////////////////////////////

  private determineType(
    node: ExpressionNode,
    scope: CurrentScope,
    filename: string,
    targetType: AbstractType | undefined): AbstractType | undefined {

    const basic = new BasicTypes(filename, scope);

    const typeExpression = node.findFirstExpression(Expressions.TypeNameOrInfer);
    const typeToken = typeExpression?.getFirstToken();
    const typeName = typeToken?.getStr();

    if (typeExpression === undefined) {
      throw new Error("determineType, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType) {
      const found = basic.lookupQualifiedName(targetType.getQualifiedName());
      if (found) {
        scope.addReference(typeToken, found, ReferenceType.InferredType, filename);
      }
      return targetType;
    }

    if (typeName !== "#") {
      const found = basic.parseType(typeExpression);
      if (found === undefined && scope.getDDIC().inErrorNamespace(typeName) === false) {
        return new VoidType(typeName);
      } else if (found === undefined) {
        throw new Error("Type \"" + typeName + "\" not found in scope, VALUE");
      }
      return found;
    }

    return targetType;
  }

}