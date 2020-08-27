import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import {INode} from "../../nodes/_inode";
import * as Expressions from "../../2_statements/expressions";
import {Dash, InstanceArrow} from "../../1_lexer/tokens";
import {StructureType, ObjectReferenceType, VoidType, DataReference, TableType, UnknownType} from "../../types/basic";
import {ComponentName} from "./component_name";
import {AttributeName} from "./attribute_name";
import {ReferenceType} from "../_reference";
import {FieldOffset} from "./field_offset";
import {FieldLength} from "./field_length";
import {TableExpression} from "./table_expression";

export class FieldChain {

  public runSyntax(
    node: ExpressionNode,
    scope: CurrentScope,
    filename: string,
    refType?: ReferenceType | undefined): AbstractType | undefined {

    const found = scope.findVariable(node.concatTokens()); // workaround for names with dashes
    if (found) {
      if (refType) {
        scope.addReference(node.getFirstToken(), found, refType, filename);
      }
      return found.getType();
    }

    const children = node.getChildren().slice();
    let context = this.findTop(children.shift(), scope, filename, refType);

    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current.get() instanceof Dash) {
        if (context instanceof UnknownType) {
          throw new Error("Not a structure, type unknown, FieldChain");
        } else if (!(context instanceof StructureType)
            && !(context instanceof TableType && context.isWithHeader())
            && !(context instanceof VoidType)) {
          throw new Error("Not a structure, FieldChain");
        }
      } else if (current.get() instanceof InstanceArrow) {
        if (!(context instanceof ObjectReferenceType)
            && !(context instanceof DataReference)
            && !(context instanceof VoidType)) {
          throw new Error("Not a object reference");
        }
      } else if (current.get() instanceof Expressions.ComponentName) {
        context = new ComponentName().runSyntax(context, current);
      } else if (current instanceof ExpressionNode
          && current.get() instanceof Expressions.TableExpression) {
        if (context instanceof VoidType) {
          continue;
        }
        if (!(context instanceof TableType)) {
          throw new Error("Table expression, expected table");
        }
        new TableExpression().runSyntax(current, scope, filename);
        // todo, additional validations
        context = context.getRowType();
      } else if (current.get() instanceof Expressions.AttributeName) {
        context = new AttributeName().runSyntax(context, current, scope, filename, refType);
      } else if (current.get() instanceof Expressions.FieldOffset && current instanceof ExpressionNode) {
        new FieldOffset().runSyntax(current, scope, filename);
      } else if (current.get() instanceof Expressions.FieldLength && current instanceof ExpressionNode) {
        new FieldLength().runSyntax(current, scope, filename);
      }

    }

    return context;
  }

  ////////////////

  private findTop(
    node: INode | undefined,
    scope: CurrentScope,
    filename: string,
    type: ReferenceType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return undefined;
    }

    if (node.get() instanceof Expressions.SourceField
        || node.get() instanceof Expressions.SourceFieldSymbol) {
      const token = node.getFirstToken();
      const name = token.getStr();
      const found = scope.findVariable(name);
      if (found === undefined) {
        throw new Error(name + " not found, findTop");
      }
      if (type) {
        scope.addReference(token, found, type, filename);
      }
      return found.getType();
    }

    if (node.get() instanceof Expressions.ClassName) {
      const classTok = node.getFirstToken();
      const classNam = classTok.getStr();
      const found = scope.existsObject(classNam);
      if (found.found === true) {
        scope.addReference(classTok, found.id, found.type, filename);
        return new ObjectReferenceType(classNam);
      } else if (scope.getDDIC().inErrorNamespace(classNam) === false) {
        return new VoidType(classNam);
      } else {
        throw new Error("Unknown class " + classNam);
      }
    }

    return undefined;
  }

}