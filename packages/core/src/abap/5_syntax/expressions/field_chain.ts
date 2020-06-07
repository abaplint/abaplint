import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import {INode} from "../../nodes/_inode";
import {SourceField, SourceFieldSymbol, ClassName, ComponentName} from "../../2_statements/expressions";
import {Dash} from "../../1_lexer/tokens";
import {StructureType} from "../../types/basic";

export class FieldChain {

  public runSyntax(node: ExpressionNode, scope: CurrentScope): AbstractType | undefined {
    const children = node.getChildren().slice();
    let context = this.findTop(children.shift(), scope);

    while (children.length > 0) {
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current.get() instanceof Dash) {
        if (!(context instanceof StructureType)) {
          throw new Error("Not a structure");
        }
      } else if (current.get() instanceof ComponentName) {
        if (!(context instanceof StructureType)) {
          throw new Error("Not a structure");
        }
        const name = current.getFirstToken().getStr();
        context = context.getComponentByName(name);
        if (context === undefined) {
          throw new Error("Component \"" + name + "\" not a structure");
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