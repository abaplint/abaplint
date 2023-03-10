import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {StructureType} from "../../types/basic/structure_type";
import {ExpressionNode} from "../../nodes";

export class ComponentChain {
  public runSyntax(context: AbstractType | undefined, node: ExpressionNode): AbstractType | undefined {

    const children = node.getChildren();
    for (let i = 0; i < children.length; i++) {
      if (context instanceof VoidType) {
        return context;
      }

      const child = children[i];
      if (i === 0 && child.concatTokens().toUpperCase() === "TABLE_LINE") {
        continue;
      } else if (child.get() instanceof Expressions.ComponentName) {
        if (!(context instanceof StructureType)) {
          throw new Error("ComponentChain, not a structure");
        }
        const name = child.concatTokens();
        context = context.getComponentByName(name);
        if (context === undefined) {
          throw new Error("Component \"" + name + "\" not found in structure");
        }
      }
    }

    return context;
  }

}