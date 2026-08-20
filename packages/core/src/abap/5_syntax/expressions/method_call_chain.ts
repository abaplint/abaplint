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
import {Visibility} from "../../4_file_information/visibility";
import {IMethodDefinition} from "../../types/_method_definition";
import {IClassDefinition} from "../../types/_class_definition";
import {IInterfaceDefinition} from "../../types/_interface_definition";
import {ClassDefinition} from "../../types/class_definition";

export class MethodCallChain {
  public static runSyntax(
    node: ExpressionNode,
    input: SyntaxInput,
    targetType?: AbstractType): AbstractType | undefined {

    const helper = new ObjectOriented(input.scope);
    const children = node.getChildren();

    const first = children[0];
    if (first === undefined) {
      const message = "MethodCallChain, first child expected";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }

    let currentIndex = 1;
    let context: AbstractType | undefined = this.findTop(first, input, targetType);
    if (first.get() instanceof Expressions.MethodCall) {
      currentIndex--;
    }

    let previous: ExpressionNode | TokenNode | undefined = undefined;
    while (currentIndex <= children.length) {
      const current = children[currentIndex];
      if (current === undefined) {
        break;
      }
      currentIndex++;

      if (current instanceof ExpressionNode && current.get() instanceof Expressions.MethodCall) {
        // for built-in methods set className to undefined
        const className = context instanceof ObjectReferenceType ? context.getIdentifierName() : undefined;
        const methodToken = current.findDirectExpression(Expressions.MethodName)?.getFirstToken();
        const methodName = methodToken?.getStr();
        const def = input.scope.findObjectDefinition(className);
        // eslint-disable-next-line prefer-const
        let {method, def: foundDef} = helper.searchMethodName(def, methodName);
        if (method === undefined && current === first) {
          method = BuiltIn.searchBuiltin(methodName?.toUpperCase());
          if (method) {
            input.scope.addReference(methodToken, method, ReferenceType.BuiltinMethodReference, input.filename);
          }
        } else {
          if (previous && previous.getFirstToken().getStr() === "=>" && method?.isStatic() === false) {
            const message = "Method \"" + methodName + "\" not static";
            input.issues.push(syntaxIssue(input, methodToken!, message));
            return VoidType.get(CheckSyntaxKey);
          }
          if (current === first && method?.isStatic() === false && input.scope.isInStaticMethod() === true) {
            const message = "Method \"" + methodName + "\" not static";
            input.issues.push(syntaxIssue(input, methodToken!, message));
            return VoidType.get(CheckSyntaxKey);
          }
          const notVisible = method ? this.checkVisibility(method, foundDef, input) : undefined;
          if (notVisible !== undefined) {
            const message = `Method "${methodName}" is ${notVisible} and cannot be accessed`;
            input.issues.push(syntaxIssue(input, methodToken!, message));
            return VoidType.get(CheckSyntaxKey);
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
          return VoidType.get(CheckSyntaxKey);
        } else if (method) {
          const ret = method.getParameters().getReturning()?.getType();
          context = ret;
        }

        const param = current.findDirectExpression(Expressions.MethodCallParam);
        if (param && method) {
          MethodCallParam.runSyntax(param, input, method);
        } else if (param && context instanceof VoidType) {
          MethodCallParam.runSyntax(param, input, context);
        }
      } else if (current instanceof ExpressionNode && current.get() instanceof Expressions.ComponentName) {
        context = ComponentName.runSyntax(context, current, input);
      } else if (current instanceof ExpressionNode && current.get() instanceof Expressions.AttributeName) {
        context = AttributeName.runSyntax(context, current, input);
      }

      previous = current;
    }

    return context;
  }

//////////////////////////////////////

  // returns the visibility as text if the method cannot be accessed from the current scope
  private static checkVisibility(
    method: IMethodDefinition,
    foundDef: IClassDefinition | IInterfaceDefinition | undefined,
    input: SyntaxInput): string | undefined {

    const visibility = method.getVisibility();
    if (visibility === Visibility.Public || foundDef === undefined) {
      return undefined;
    } else if (!(foundDef instanceof ClassDefinition)) {
      // interface members are always public
      return undefined;
    }

    const name = foundDef.getName().toUpperCase();
    const enclosing = input.scope.getEnclosingClassName()?.toUpperCase();
    if (enclosing === undefined || enclosing === name) {
      return undefined;
    }

    if (foundDef.getFriends().some(f => f.toUpperCase() === enclosing)
        || input.scope.isLocalFriend(foundDef.getName(), enclosing)) {
      return undefined;
    }

    if (visibility === Visibility.Protected) {
      // subclasses can access protected members
      let sup = input.scope.findClassDefinition(enclosing)?.getSuperClass();
      while (sup !== undefined) {
        if (sup.toUpperCase() === name) {
          return undefined;
        }
        sup = input.scope.findClassDefinition(sup)?.getSuperClass();
      }
      return "protected";
    }

    return "private";
  }

  private static findTop(first: INode, input: SyntaxInput, targetType: AbstractType | undefined): AbstractType | undefined {
    if (first.get() instanceof Expressions.ClassName) {
      const token = first.getFirstToken();
      const className = token.getStr();
      const classDefinition = input.scope.findObjectDefinition(className);
      if (classDefinition === undefined && input.scope.getDDIC().inErrorNamespace(className) === false) {
        const extra: IReferenceExtras = {ooName: className, ooType: "Void"};
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, extra);
        return VoidType.get(className);
      } else if (classDefinition === undefined) {
        const message = "Class " + className + " not found";
        input.issues.push(syntaxIssue(input, first.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
      input.scope.addReference(first.getFirstToken(), classDefinition, ReferenceType.ObjectOrientedReference, input.filename);
      return new ObjectReferenceType(classDefinition);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.FieldChain) {
      return FieldChain.runSyntax(first, input, ReferenceType.DataReadReference);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.NewObject) {
      return NewObject.runSyntax(first, input, targetType);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.Cast) {
      return Cast.runSyntax(first, input, targetType);
    } else {
      const meType = input.scope.findVariable("me")?.getType();
      if (meType) {
        return meType;
      }
    }
    return undefined;
  }

}