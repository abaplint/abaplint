import {ExpressionNode, TokenNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {MethodCallChain} from "./method_call_chain";
import {UnknownType} from "../../types/basic/unknown_type";
import {FieldChain} from "./field_chain";
import {VoidType, StringType, CharacterType, DataReference, ObjectReferenceType, FloatType, IntegerType, XSequenceType, XStringType, HexType, XGenericType} from "../../types/basic";
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
import {FilterBody} from "./filter_body";
import {CorrespondingBody} from "./corresponding_body";
import {BuiltIn} from "../_builtin";
import {AttributeChain} from "./attribute_chain";
import {Dereference} from "./dereference";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {TypeUtils} from "../_type_utils";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AssertError} from "../assert_error";

/*
* Type interference, valid scenarios:
* typed = VALUE #( ... ).         right hand side must follow left hand type
* DATA(bar) = VALUE type( ... ).  left gets the type of rigthand
* typed = VALUE type( ... ).      types must match and be compatible???
************* ERRORS *********
* VALUE #( ... ).                 syntax error
* DATA(bar) = VALUE #( ... ).     give error, no type can be derived
*/

// TODO: refactor all these method parameters to objects, this is getting messy
export class Source {
  public static runSyntax(
    node: ExpressionNode | undefined,
    input: SyntaxInput,
    targetType?: AbstractType,
    writeReference = false,
    allowGenericDeference = false): AbstractType | undefined {

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
        case "+":
        case "BIT":
          break;
        case "BOOLC":
        {
          const method = new BuiltIn().searchBuiltin(tok);
          input.scope.addReference(token, method, ReferenceType.BuiltinMethodReference, input.filename);
          Cond.runSyntax(node.findDirectExpression(Expressions.Cond)!, input);
          return StringType.get();
        }
        case "XSDBOOL":
        {
          const method = new BuiltIn().searchBuiltin(tok);
          input.scope.addReference(token, method, ReferenceType.BuiltinMethodReference, input.filename);
          Cond.runSyntax(node.findDirectExpression(Expressions.Cond)!, input);
          return new CharacterType(1, {qualifiedName: "ABAP_BOOL", ddicName: "ABAP_BOOL"});
        }
        case "REDUCE":
        {
          const foundType = this.determineType(node, input, targetType);
          const bodyType = ReduceBody.runSyntax(node.findDirectExpression(Expressions.ReduceBody), input, foundType);
          if (foundType === undefined || foundType.isGeneric()) {
            this.addIfInferred(node, input, bodyType);
          } else {
            this.addIfInferred(node, input, foundType);
          }
          return foundType ? foundType : bodyType;
        }
        case "SWITCH":
        {
          const foundType = this.determineType(node, input, targetType);
          const bodyType = SwitchBody.runSyntax(node.findDirectExpression(Expressions.SwitchBody), input);
          if (foundType === undefined || foundType.isGeneric()) {
            this.addIfInferred(node, input, bodyType);
          } else {
            this.addIfInferred(node, input, foundType);
          }
          return foundType ? foundType : bodyType;
        }
        case "COND":
        {
          const foundType = this.determineType(node, input, targetType);
          const bodyType = CondBody.runSyntax(node.findDirectExpression(Expressions.CondBody), input, foundType);
          console.log("COND BODY type;:");
          console.dir(bodyType);
          if (foundType === undefined || foundType.isGeneric()) {
            this.addIfInferred(node, input, bodyType);
          } else {
            this.addIfInferred(node, input, foundType);
          }
          children.shift();
          children.shift();
          children.shift();
          children.shift();
          this.traverseRemainingChildren(children, input);
          return foundType ? foundType : bodyType;
        }
        case "CONV":
        {
          const foundType = this.determineType(node, input, targetType);
          const bodyType = ConvBody.runSyntax(node.findDirectExpression(Expressions.ConvBody)!, input);
          if (new TypeUtils(input.scope).isConvable(foundType, bodyType) === false) {
            const message = `CONV: Types not compatible, ${foundType?.constructor.name}, ${bodyType?.constructor.name}`;
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return VoidType.get(CheckSyntaxKey);
          }
          this.addIfInferred(node, input, foundType);
          return foundType;
        }
        case "REF":
        {
          let foundType = this.determineType(node, input, targetType);
          const s = Source.runSyntax(node.findDirectExpression(Expressions.Source), input);
          /*
          console.dir(node.concatTokens());
          console.dir(targetType);
          console.dir(foundType);
          console.dir(s);
          */
          if (foundType === undefined && s) {
            foundType = new DataReference(s);
          } else if (foundType && targetType === undefined) {
            foundType = new DataReference(foundType);
          }

          if (targetType && !(targetType instanceof DataReference)) {
            const message = `REF: Types not compatible`;
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          }

          this.addIfInferred(node, input, foundType);
          return foundType;
        }
        case "FILTER":
        {
          const foundType = this.determineType(node, input, targetType);
          const bodyType = FilterBody.runSyntax(node.findDirectExpression(Expressions.FilterBody), input, foundType);
          if (foundType === undefined || foundType.isGeneric()) {
            this.addIfInferred(node, input, bodyType);
          } else {
            this.addIfInferred(node, input, foundType);
          }

          if (foundType && !(foundType instanceof UnknownType)) {
            return foundType;
          } else {
            return bodyType;
          }
        }
        case "CORRESPONDING":
        {
          const foundType = this.determineType(node, input, targetType);
          CorrespondingBody.runSyntax(node.findDirectExpression(Expressions.CorrespondingBody), input, foundType);
          this.addIfInferred(node, input, foundType);
          return foundType;
        }
        case "EXACT":
        {
          const foundType = this.determineType(node, input, targetType);
          Source.runSyntax(node.findDirectExpression(Expressions.Source), input, foundType);
          this.addIfInferred(node, input, foundType);
          return foundType;
        }
        case "VALUE":
        {
          const foundType = this.determineType(node, input, targetType);
          const bodyType = ValueBody.runSyntax(node.findDirectExpression(Expressions.ValueBody), input, foundType);
          if (foundType === undefined || foundType.isGeneric()) {
            this.addIfInferred(node, input, bodyType);
          } else {
            this.addIfInferred(node, input, foundType);
          }
          return foundType ? foundType : bodyType;
        }
        default:
          return new UnknownType("todo, Source type " + tok);
      }
    } else if (first === undefined || !(first instanceof ExpressionNode)) {
      return undefined;
    }

    let context: AbstractType | undefined = new UnknownType("todo, Source type");

    const type = [ReferenceType.DataReadReference];
    if (writeReference) {
      type.push(ReferenceType.DataWriteReference);
    }

    let hexExpected = false;
    let hexNext = false;
    while (children.length >= 0) {
      if (first instanceof ExpressionNode) {
        const get = first.get();
        if (get instanceof Expressions.MethodCallChain) {
          context = MethodCallChain.runSyntax(first, input, targetType);
          if (context === undefined) {
            const message = "Method has no RETURNING value";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return VoidType.get(CheckSyntaxKey);
          }
        } else if (get instanceof Expressions.FieldChain) {
          context = FieldChain.runSyntax(first, input, type, allowGenericDeference);
        } else if (get instanceof Expressions.StringTemplate) {
          context = StringTemplate.runSyntax(first, input);
        } else if (get instanceof Expressions.Source) {
          const found = Source.runSyntax(first, input);
          context = this.infer(context, found);
        } else if (get instanceof Expressions.Constant) {
          const found = Constant.runSyntax(first);
          context = this.infer(context, found);
        } else if (get instanceof Expressions.Dereference) {
          context = Dereference.runSyntax(first, context, input);
        } else if (get instanceof Expressions.ComponentChain) {
          context = ComponentChain.runSyntax(context, first, input);
        } else if (get instanceof Expressions.ArithOperator) {
          if (first.concatTokens() === "**") {
            context = new FloatType();
          }
          const operator = first.concatTokens().toUpperCase();
          if (operator === "BIT-OR" || operator === "BIT-AND" || operator === "BIT-XOR") {
            hexExpected = true;
            hexNext = true;
          }
        } else if (get instanceof Expressions.AttributeChain) {
          context = AttributeChain.runSyntax(context, first, input, type);
        }
      }

      if (hexExpected === true) {
        if (!(context instanceof VoidType)
            && !(context instanceof XStringType)
            && !(context instanceof HexType)
            && !(context instanceof XGenericType)
            && !(context instanceof XSequenceType)
            && !(context instanceof UnknownType)) {
          const message = "Operator only valid for XSTRING or HEX";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
        if (hexNext === false) {
          hexExpected = false;
        }
        hexNext = false;
      }

      first = children.shift();
      if (first === undefined) {
        break;
      }
    }

    if (node.findDirectTokenByText("&&")) {
      return StringType.get();
    }

    return context;
  }

////////////////////////////////

  private static traverseRemainingChildren(children: (ExpressionNode | TokenNode)[], input: SyntaxInput) {
    const last = children[children.length - 1];
    if (last && last.get() instanceof Expressions.Source) {
      Source.runSyntax(last as ExpressionNode, input);
    }
  }

  private static infer(context: AbstractType | undefined, found: AbstractType | undefined) {
    if (context instanceof FloatType && found instanceof IntegerType) {
      return context;
    } else {
      return found;
    }
  }

  public static addIfInferred(
    node: ExpressionNode,
    input: SyntaxInput,
    inferredType: AbstractType | undefined): void {

    const basic = new BasicTypes(input);
    const typeExpression = node.findDirectExpression(Expressions.TypeNameOrInfer);
    const typeToken = typeExpression?.getFirstToken();
    const typeName = typeToken?.getStr();

    /*
    console.dir(inferredType);
    console.dir(typeToken);
    */

    // hmm, need to align all this
    if (typeName === "#" && inferredType && typeToken) {
      const found = basic.lookupQualifiedName(inferredType.getQualifiedName());
      if (found) {
        input.scope.addReference(typeToken, found, ReferenceType.InferredType, input.filename);
      } else if (inferredType instanceof DataReference) {
        const tid = new TypedIdentifier(typeToken, input.filename, inferredType);
        input.scope.addReference(typeToken, tid, ReferenceType.InferredType, input.filename);
      } else if (inferredType instanceof ObjectReferenceType) {
        const def = input.scope.findObjectDefinition(inferredType.getQualifiedName());
        if (def) {
          const tid = new TypedIdentifier(typeToken, input.filename, inferredType);
          input.scope.addReference(typeToken, tid, ReferenceType.InferredType, input.filename);
        }
      } else if (inferredType instanceof CharacterType) {
        // character is bit special it does not have a qualified name eg "TYPE c LENGTH 6"
        const tid = new TypedIdentifier(typeToken, input.filename, inferredType);
        input.scope.addReference(typeToken, tid, ReferenceType.InferredType, input.filename);
      }
    }

  }

  private static determineType(
    node: ExpressionNode,
    input: SyntaxInput,
    targetType: AbstractType | undefined): AbstractType | undefined {

    const basic = new BasicTypes(input);
    const typeExpression = node.findDirectExpression(Expressions.TypeNameOrInfer);
    const typeToken = typeExpression?.getFirstToken();
    const typeName = typeToken?.getStr();

    if (typeExpression === undefined) {
      throw new AssertError("determineType, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType) {
      return targetType;
    }

    if (typeName !== "#" && typeToken) {
      const found = basic.parseType(typeExpression);
      if (found && found instanceof UnknownType) {
        if (input.scope.getDDIC().inErrorNamespace(typeName) === false) {
          input.scope.addReference(typeToken, undefined, ReferenceType.VoidType, input.filename);
          return VoidType.get(typeName);
        } else {
          const tid = new TypedIdentifier(typeToken, input.filename, found);
          input.scope.addReference(typeToken, tid, ReferenceType.TypeReference, input.filename);
          return found;
        }
      } else if (found === undefined) {
        const message = "Type \"" + typeName + "\" not found in scope, VALUE";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }

      return found;
    }

    return targetType;
  }

}