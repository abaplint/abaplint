import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import {INode} from "../../nodes/_inode";
import {SourceField, SourceFieldSymbol, ClassName, ComponentName, AttributeName} from "../../2_statements/expressions";
import {Dash, InstanceArrow} from "../../1_lexer/tokens";
import {StructureType, ObjectReferenceType, VoidType} from "../../types/basic";
import {ObjectOriented} from "../_object_oriented";

export class FieldChain {

  public runSyntax(node: ExpressionNode, scope: CurrentScope): AbstractType | undefined {
    const helper = new ObjectOriented(scope);
    const children = node.getChildren().slice();
    let context = this.findTop(children.shift(), scope);

    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current.get() instanceof Dash) {
        if (!(context instanceof StructureType) && !(context instanceof VoidType)) {
          throw new Error("Not a structure");
        }
      } else if (current.get() instanceof InstanceArrow) {
        if (!(context instanceof ObjectReferenceType) && !(context instanceof VoidType)) {
          throw new Error("Not a object reference");
        }
      } else if (current.get() instanceof ComponentName) {
        if (context instanceof VoidType) {
          continue;
        }
        if (!(context instanceof StructureType)) {
          throw new Error("Not a structure");
        }
        const name = current.getFirstToken().getStr();
        context = context.getComponentByName(name);
        if (context === undefined) {
          throw new Error("Component \"" + name + "\" not found in structure");
        }
      } else if (current.get() instanceof AttributeName) {
        if (context instanceof VoidType) {
          continue;
        }
        if (!(context instanceof ObjectReferenceType)) {
          throw new Error("Not a object reference");
        }
        const def = scope.findObjectDefinition(context.getName());
        if (def === undefined) {
          throw new Error("Definition for \"" + context.getName() + "\" not found in scope");
        }
        const name = current.getFirstToken().getStr();
        context = helper.searchAttributeName(def, name)?.getType();
        if (context === undefined) {
          throw new Error("Attribute \"" + name + "\" not found");
        }
      }

    }

    return context;
  }

  ////////////////

  private findTop(node: INode | undefined, scope: CurrentScope): AbstractType | undefined {
    if (node === undefined) {
      return undefined;
    }

    if (node.get() instanceof SourceField || node.get() instanceof SourceFieldSymbol) {
      const foobar = node.getFirstToken().getStr();
      const found = scope.findVariable(foobar);
      if (found === undefined) {
        throw new Error(foobar + " not found");
      }
      return found.getType();
    }

    if (node.get() instanceof ClassName) {
      throw new Error("todo, FieldChain, ClassName");
    }

    return undefined;
  }

}