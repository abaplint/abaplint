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
import {ClassDefinition} from "../../types";
import {Version} from "../../../version";
import {SyntaxInput} from "../_syntax_input";

export class MethodSource {

  public runSyntax(node: ExpressionNode, input: SyntaxInput): IMethodDefinition | VoidType | undefined {

    const helper = new ObjectOriented(input.scope);
    const children = node.getChildren().slice();

    const first = children.shift();
    if (first === undefined) {
      throw new Error("MethodSource, first child expected");
    }

    let context: AbstractType | IMethodDefinition | undefined = this.findTop(first, input);
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
        throw new Error(`Class "${name}" not found/released`);
      }
    }

    if (context instanceof VoidType) {
      // todo, if there are more dynamic with variables, the references for the variables are not added?
      return context;
    }

    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current.get() instanceof Dash) {
        if (context instanceof UnknownType) {
          throw new Error("Not a structure, type unknown, MethodSource");
        } else if (!(context instanceof StructureType)) {
          throw new Error("Not a structure, MethodSource");
        }
      } else if (current.get() instanceof InstanceArrow
          || current.get() instanceof StaticArrow) {
// todo, handling static vs instance

      } else if (current.get() instanceof Expressions.AttributeName
          || current.get() instanceof Expressions.SourceField) {
        try {
          if (context instanceof AbstractType) {
            const attr = new AttributeName().runSyntax(context, current, input, ReferenceType.DataReadReference);
            context = attr;
            continue;
          }
        } catch {
          // ignore
        }

        // try looking for method name
        const className = context instanceof ObjectReferenceType ? context.getIdentifierName() : undefined;
        const methodToken = current.getFirstToken();
        const methodName = methodToken?.getStr();
        const def = input.scope.findObjectDefinition(className);
        // eslint-disable-next-line prefer-const
        let {method, def: foundDef} = helper.searchMethodName(def, methodName);

        if (method === undefined && methodName?.toUpperCase() === "CONSTRUCTOR") {
          context = new VoidType("CONSTRUCTOR"); // todo, this is a workaround, constructors always exists
        } else if (method === undefined && !(context instanceof VoidType)) {
          throw new Error("Method or attribute \"" + methodName + "\" not found, MethodSource");
        } else if (method) {
          const extra: IReferenceExtras = {
            ooName: foundDef?.getName(),
            ooType: foundDef instanceof ClassDefinition ? "CLAS" : "INTF"};
          input.scope.addReference(methodToken, method, ReferenceType.MethodReference, input.filename, extra);

          context = method;
        }

      } else if (current.get() instanceof Expressions.ComponentName && context instanceof AbstractType) {
        if (context instanceof TableType && context.isWithHeader()) {
          context = context.getRowType();
        }
        context = new ComponentName().runSyntax(context, current, input);
      } else if (current instanceof ExpressionNode && current.get() instanceof Expressions.Dynamic) {
        new Dynamic().runSyntax(current, input);
        context = new VoidType("Dynamic");
      }
    }

    if (context instanceof AbstractType && !(context instanceof VoidType)) {
      throw new Error("Not a method, MethodSource");
    } else if (context === undefined) {
      throw new Error("Not found, MethodSource");
    }

    return context;
  }

//////////////////////////////////////

  private findTop(first: INode, input: SyntaxInput): AbstractType | undefined {
    if (first.get() instanceof Expressions.ClassName) {
      // todo, refactor this part to new expression handler,
      const token = first.getFirstToken();
      const className = token.getStr();
      const classDefinition = input.scope.findObjectDefinition(className);
      if (classDefinition === undefined && input.scope.getDDIC().inErrorNamespace(className) === false) {
        const extra: IReferenceExtras = {ooName: className, ooType: "Void"};
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, extra);
        return new VoidType(className);
      } else if (classDefinition === undefined) {
        throw new Error("Class " + className + " not found");
      }
      input.scope.addReference(first.getFirstToken(), classDefinition, ReferenceType.ObjectOrientedReference, input.filename);
      return new ObjectReferenceType(classDefinition);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.SourceField) {
      try {
        return new SourceField().runSyntax(first, input, ReferenceType.DataReadReference);
      } catch {
        return undefined;
      }
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.SourceFieldSymbol) {
      return new SourceFieldSymbol().runSyntax(first, input);
    } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.Dynamic) {
      new Dynamic().runSyntax(first, input);
      return new VoidType("Dynamic");
    }

    return undefined;
  }

}