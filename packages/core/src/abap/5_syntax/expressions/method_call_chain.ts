import {ExpressionNode, TokenNode} from "../../nodes";
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
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class MethodCallChain {
  public runSyntax(
    node: ExpressionNode,
    input: SyntaxInput,
    targetType?: AbstractType): AbstractType | undefined {

    const helper = new ObjectOriented(input.scope);
    const children = node.getChildren().slice();

    const first = children.shift();
    if (first === undefined) {
      const message = "MethodCallChain, first child expected";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return new VoidType(CheckSyntaxKey);
    }

    let context: AbstractType | undefined = this.findTop(first, input, targetType);
    if (first.get() instanceof Expressions.MethodCall) {
      children.unshift(first);
    }

    let previous: ExpressionNode | TokenNode | undefined = undefined;
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
        const def = input.scope.findObjectDefinition(className);
        // eslint-disable-next-line prefer-const
        let {method, def: foundDef} = helper.searchMethodName(def, methodName);
        if (method === undefined && current === first) {
          method = new BuiltIn().searchBuiltin(methodName?.toUpperCase());
          if (method) {
            input.scope.addReference(methodToken, method, ReferenceType.BuiltinMethodReference, input.filename);
          }
        } else {
          if (previous && previous.getFirstToken().getStr() === "=>" && method?.isStatic() === false) {
            const message = "Method \"" + methodName + "\" not static";
            input.issues.push(syntaxIssue(input, methodToken!, message));
            return new VoidType(CheckSyntaxKey);
          }
          const voidedName = context instanceof VoidType ? context.getVoided() : undefined;
          const extra = helper.methodReferenceExtras(foundDef, className || voidedName);
          input.scope.addReference(methodToken, method, ReferenceType.MethodReference, input.filename, extra);
        }
        if (methodName?.includes("~")) {
          const name = methodName.split("~")[0];
          const idef = input.scope.findInterfaceDefinition(name);
          if (idef) {
            input.scope.addReference(methodToken, idef, ReferenceType.ObjectOrientedReference, input.filename);
          }
        }

        if (method === undefined && methodName?.toUpperCase() === "CONSTRUCTOR") {
          context = undefined; // todo, this is a workaround, constructors always exists
        } else if (method === undefined && !(context instanceof VoidType)) {
          const message = "Method \"" + methodName + "\" not found, methodCallChain";
          input.issues.push(syntaxIssue(input, methodToken!, message));
          return new VoidType(CheckSyntaxKey);
        } else if (method) {
          const ret = method.getParameters().getReturning()?.getType();
          context = ret;
        }

        const param = current.findDirectExpression(Expressions.MethodCallParam);
        if (param && method) {
          new MethodCallParam().runSyntax(param, input, method);
        } else if (param && context instanceof VoidType) {
          new MethodCallParam().runSyntax(param, input, context);
        }
      } else if (current instanceof ExpressionNode && current.get() instanceof Expressions.ComponentName) {
        context = new ComponentName().runSyntax(context, current, input);
      } else if (current instanceof ExpressionNode && current.get() instanceof Expressions.AttributeName) {
        context = new AttributeName().runSyntax(context, current, input);
      }

      previous = current;
    }

    return context;
  }

//////////////////////////////////////

  private findTop(first: INode, input: SyntaxInput, targetType: AbstractType | undefined): AbstractType | undefined {
    if (first.get() instanceof Expressions.ClassName) {
      const token = first.getFirstToken();
      const className = token.getStr();
      const classDefinition = input.scope.findObjectDefinition(className);
      if (classDefinition === undefined && input.scope.getDDIC().inErrorNamespace(className) === false) {
        const extra: IReferenceExtras = {ooName: className, ooType: "Void"};
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, extra);
        return new VoidType(className);
      } else if (classDefinition === undefined) {
        const message = "Class " + className + " not found";
        input.issues.push(syntaxIssue(input, first.getFirstToken(), message));
        return new VoidType(CheckSyntaxKey);
      }
      input.scope.addReference(first.getFirstToken(), classDefinition, ReferenceType.ObjectOrientedReference, input.filename);
      return new ObjectReferenceType(classDefinition);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.FieldChain) {
      return new FieldChain().runSyntax(first, input, ReferenceType.DataReadReference);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.NewObject) {
      return new NewObject().runSyntax(first, input, targetType);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.Cast) {
      return new Cast().runSyntax(first, input, targetType);
    } else {
      const meType = input.scope.findVariable("me")?.getType();
      if (meType) {
        return meType;
      }
    }
    return undefined;
  }

}