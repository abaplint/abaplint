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

export class Target {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): AbstractType | undefined {

    const children = node.getChildren().slice();
    const first = children.shift();
    if (first === undefined || !(first instanceof ExpressionNode)) {
      return undefined;
    }

    let context = this.findTop(first, scope, filename);
    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current.get() instanceof Dash) {
        if (!(context instanceof StructureType) && !(context instanceof VoidType)) {
          throw new Error("Not a structure, target");
        }
      } else if (current.get() instanceof InstanceArrow) {
        if (!(context instanceof ObjectReferenceType)
            && !(context instanceof DataReference)
            && !(context instanceof VoidType)) {
          throw new Error("Not a object reference");
        }
      } else if (current.get() instanceof Expressions.ComponentName) {
        context = new ComponentName().runSyntax(context, current);
      } else if (current.get() instanceof Expressions.TableExpression) {
        if (context instanceof VoidType) {
          continue;
        }
        if (!(context instanceof TableType)) {
          throw new Error("Table expression, expected table");
        }
        // todo, additional validations
        context = context.getRowType();
      } else if (current.get() instanceof Expressions.AttributeName) {
        context = new AttributeName().runSyntax(context, current, scope);
      }
    }

    return context;
  }

  private findTop(node: INode | undefined, scope: CurrentScope, _filename: string): AbstractType | undefined {
    if (node === undefined) {
      return undefined;
    }

    const name = node.getFirstToken().getStr();

    if (node.get() instanceof Expressions.TargetField
        || node.get() instanceof Expressions.TargetFieldSymbol) {
      return scope.findVariable(name)?.getType();
    } else if (node.get() instanceof Expressions.ClassName) {
      if (scope.findObjectDefinition(name)) {
        return new ObjectReferenceType(name);
      } else if (scope.getDDIC().inErrorNamespace(name) === false) {
        return new VoidType(name);
      } else {
        return new UnknownType(name + " unknown, Target");
      }
    }

    return new UnknownType("unknown target type");
  }
}