import {INode} from "../../nodes/_inode";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {StructureType} from "../../types/basic/structure_type";

export class ComponentChain {
  public runSyntax(context: AbstractType | undefined, node: INode): AbstractType | undefined {
    if (context instanceof VoidType) {
      return context;
    }

    if (!(context instanceof StructureType)) {
      throw new Error("ComponentChain, not a structure");
    }

    const name = node.getFirstToken().getStr();
    const ret = context.getComponentByName(name);
    if (ret === undefined) {
      throw new Error("Component \"" + name + "\" not found in structure");
    }

// todo, add more here

    return ret;
  }

}