import {INode} from "../../nodes/_inode";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {StructureType} from "../../types/basic/structure_type";

export class ComponentChain {
  public runSyntax(context: AbstractType | undefined, node: INode): AbstractType | undefined {
    if (context instanceof VoidType) {
      return context;
    }

    const name = node.getFirstToken().getStr();

    if (!(context instanceof StructureType)) {
      if (name.toUpperCase() === "TABLE_LINE") {
        return context;
      }
      throw new Error("ComponentChain, not a structure");
    }

    if (name.toUpperCase() === "TABLE_LINE") {
      return context;
    }

    const ret = context.getComponentByName(name);
    if (ret === undefined) {
      throw new Error("Component \"" + name + "\" not found in structure");
    }

// todo, add more here

    return ret;
  }

}