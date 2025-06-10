import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {Dynamic} from "./dynamic";
import {ObjectReferenceType, StructureType, TableType, UnknownType, VoidType} from "../../types/basic";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {ObjectOriented} from "../_object_oriented";
import {IMethodDefinition} from "../../types/_method_definition";
import {INode} from "../../nodes/_inode";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SourceFieldSymbol} from "./source_field_symbol";
import {SourceField} from "./source_field";
import {Dash, InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {AttributeName} from "./attribute_name";
import {ComponentName} from "./component_name";
import {Version} from "../../../version";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AssertError} from "../assert_error";

export class MethodSource {

  public static runSyntax(node: ExpressionNode, input: SyntaxInput): IMethodDefinition | VoidType | undefined {

    const helper = new ObjectOriented(input.scope);
    const children = node.getChildren().slice();

    const first = children.shift();
    if (first === undefined) {
      throw new AssertError("MethodSource, first child expected");
    }

    let context: AbstractType | IMethodDefinition | undefined = this.findTop(first, input, children);
    if (context === undefined) {
      context = input.scope.findVariable("me")?.getType();
      children.unshift(first);
    }

    if (input.scope.getVersion() === Version.Cloud
        && first.get() instanceof Expressions.Dynamic
        && first instanceof ExpressionNode
        && children[0]?.concatTokens() === "=>") {
      const name = first.findDirectExpression(Expressions.Constant)?.concatTokens().replace(/'/g, "").replace(/`/g, "");
      if (name !== undefined && input.scope.findClassDefinition(name) === undefined) {
        const message = `Class "${name}" not found/released`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
    }

    if (context instanceof VoidType) {
      while (children.length > 0) {
        const current = children.shift();
        if (current instanceof ExpressionNode && current.get() instanceof Expressions.Dynamic) {
          Dynamic.runSyntax(current, input);
        }
      }

      return context;
    }

    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current.get() instanceof Dash) {
        if (context instanceof UnknownType) {
          const message = "Not a structure, type unknown, MethodSource";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        } else if (!(context instanceof StructureType)) {
          const message = "Not a structure, MethodSource";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
      } else if (current.get() instanceof InstanceArrow
          || current.get() instanceof StaticArrow) {
// todo, handling static vs instance

      } else if (current.get() instanceof Expressions.AttributeName
          || current.get() instanceof Expressions.SourceField) {

        if (context instanceof AbstractType) {
          const attr = AttributeName.runSyntax(context, current, input, ReferenceType.DataReadReference, false);
          const isSyntaxError = attr instanceof VoidType && attr.getVoided() === CheckSyntaxKey;
          if (isSyntaxError === false) {
            context = attr;
            continue;
          }
        }

        // try looking for method name
        const className = context instanceof ObjectReferenceType ? context.getIdentifierName() : undefined;
        const methodToken = current.getFirstToken();
        const methodName = methodToken?.getStr();
        const def = input.scope.findObjectDefinition(className);
        // eslint-disable-next-line prefer-const
        let {method, def: foundDef} = helper.searchMethodName(def, methodName);

        if (method === undefined && methodName?.toUpperCase() === "CONSTRUCTOR") {
          context = VoidType.get("CONSTRUCTOR"); // todo, this is a workaround, constructors always exists
        } else if (method === undefined && !(context instanceof VoidType)) {
          const message = "Method or attribute \"" + methodName + "\" not found, MethodSource";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        } else if (method) {
          const extra = helper.methodReferenceExtras(foundDef, className);
          input.scope.addReference(methodToken, method, ReferenceType.MethodReference, input.filename, extra);

          context = method;
        }

      } else if (current.get() instanceof Expressions.ComponentName && context instanceof AbstractType) {
        if (context instanceof TableType && context.isWithHeader()) {
          context = context.getRowType();
        }
        context = ComponentName.runSyntax(context, current, input);
      } else if (current instanceof ExpressionNode && current.get() instanceof Expressions.Dynamic) {
        Dynamic.runSyntax(current, input);
        context = VoidType.get("Dynamic");
      }
    }

    if (context instanceof AbstractType && !(context instanceof VoidType)) {
      const message = "Not a method, MethodSource";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    } else if (context === undefined) {
      const message = "Not found, MethodSource";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }

    return context;
  }

//////////////////////////////////////

  private static findTop(first: INode, input: SyntaxInput, children: any[]): AbstractType | undefined {
    if (first.get() instanceof Expressions.ClassName) {
      // todo, refactor this part to new expression handler,
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
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.SourceField && children.length > 0) {
      return SourceField.runSyntax(first, input, ReferenceType.DataReadReference);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.SourceFieldSymbol) {
      return SourceFieldSymbol.runSyntax(first, input);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.Dynamic) {
      Dynamic.runSyntax(first, input);
      return VoidType.get("Dynamic");
    }

    return undefined;
  }

}