import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import {UnknownType} from "../../types/basic/unknown_type";
import {INode} from "../../nodes/_inode";
import {Dash, InstanceArrow} from "../../1_lexer/tokens";
import {StructureType, ObjectReferenceType, VoidType, DataReference, TableType} from "../../types/basic";
import {ComponentName} from "./component_name";
import {AttributeName} from "./attribute_name";
import {FieldOffset} from "./field_offset";
import {ReferenceType} from "../_reference";
import {TableExpression} from "./table_expression";

export class Target {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): AbstractType | undefined {

    const concat = node.concatTokens();
    if (concat.includes("-")) {
      // workaround for names with dashes
      const found = scope.findVariable(concat);
      if (found) {
        scope.addReference(node.getFirstToken(), found, ReferenceType.DataWriteReference, filename);
        return found.getType();
      }
    }

    const children = node.getChildren().slice();
    const first = children.shift();
    if (first === undefined || !(first instanceof ExpressionNode)) {
      return undefined;
    }

    let context = this.findTop(first, scope, filename);
    if (context === undefined) {
      throw new Error(`"${first.getFirstToken().getStr()}" not found, Target`);
    }

    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current.get() instanceof Dash) {
        if (context instanceof UnknownType) {
          throw new Error("Not a structure, type unknown, target");
        } else if (!(context instanceof StructureType)
            && !(context instanceof TableType && context.isWithHeader() && context.getRowType() instanceof StructureType)
            && !(context instanceof TableType && context.isWithHeader() && context.getRowType() instanceof VoidType)
            && !(context instanceof VoidType)) {
          throw new Error("Not a structure, target");
        }
      } else if (current.get() instanceof InstanceArrow) {
        if (!(context instanceof ObjectReferenceType)
            && !(context instanceof DataReference)
            && !(context instanceof VoidType)) {
          throw new Error("Not a object reference, target");
        }
      } else if (current.get() instanceof Expressions.ComponentName) {
        context = new ComponentName().runSyntax(context, current);
      } else if (current instanceof ExpressionNode
          && current.get() instanceof Expressions.TableExpression) {
        if (!(context instanceof TableType) && !(context instanceof VoidType)) {
          throw new Error("Table expression, expected table");
        }
        new TableExpression().runSyntax(current, scope, filename);
        if (!(context instanceof VoidType)) {
          context = context.getRowType();
        }
      } else if (current.get() instanceof Expressions.AttributeName) {
        const type = children.length === 0 ? ReferenceType.DataWriteReference : ReferenceType.DataReadReference;
        context = new AttributeName().runSyntax(context, current, scope, filename, type);
      }
    }

    const offset = node.findDirectExpression(Expressions.FieldOffset);
    if (offset) {
      new FieldOffset().runSyntax(offset, scope, filename);
    }

    return context;
  }

/////////////////////////////////

  private findTop(node: INode | undefined, scope: CurrentScope, filename: string): AbstractType | undefined {
    if (node === undefined) {
      return undefined;
    }

    const token = node.getFirstToken();
    const name = token.getStr();

    if (node.get() instanceof Expressions.TargetField
        || node.get() instanceof Expressions.TargetFieldSymbol) {
      const found = scope.findVariable(name);
      if (found) {
        scope.addReference(token, found, ReferenceType.DataWriteReference, filename);
      }
      if (name.includes("~")) {
        const idef = scope.findInterfaceDefinition(name.split("~")[0]);
        if (idef) {
          scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, filename);
        }
      }
      return found?.getType();
    } else if (node.get() instanceof Expressions.ClassName) {
      const found = scope.findObjectDefinition(name);
      if (found) {
        scope.addReference(token, found, ReferenceType.ObjectOrientedReference, filename);
        return new ObjectReferenceType(found);
      } else if (scope.getDDIC().inErrorNamespace(name) === false) {
        scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, filename, {ooName: name, ooType: "CLAS"});
        return new VoidType(name);
      } else {
        return new UnknownType(name + " unknown, Target");
      }
    }

    return new UnknownType("unknown target type");
  }
}