import {INode} from "../../nodes/_inode";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {StructureType} from "../../types/basic/structure_type";
import {ObjectReferenceType} from "../../types/basic/object_reference_type";
import {ObjectOriented} from "../_object_oriented";
import {CurrentScope} from "../_current_scope";
import {DataReference} from "../../types/basic/data_reference_type";

export class AttributeName {
  public runSyntax(context: AbstractType | undefined, node: INode, scope: CurrentScope): AbstractType | undefined {
    if (context instanceof VoidType) {
      return context;
    }

    const helper = new ObjectOriented(scope);

    let ret: AbstractType | undefined = undefined;

    if (context instanceof ObjectReferenceType) {
      const def = scope.findObjectDefinition(context.getName());
      if (def === undefined) {
        throw new Error("Definition for \"" + context.getName() + "\" not found in scope");
      }
      const name = node.getFirstToken().getStr();
      ret = helper.searchAttributeName(def, name)?.getType();
      if (ret === undefined) {
        ret = helper.searchConstantName(def, name)?.getType();
      }
      if (ret === undefined) {
        throw new Error("Attribute or constant \"" + name + "\" not found in \"" + def.getName() + "\"");
      }
    } else if (context instanceof DataReference) {
      const sub = context.getType();
      if (!(sub instanceof StructureType)) {
        throw new Error("Data reference not structured");
      }
      const name = node.getFirstToken().getStr();
      if (name === "*") {
        return sub;
      }
      ret = sub.getComponentByName(name);
      if (ret === undefined) {
        throw new Error("Component \"" + name + "\" not found in data reference structure");
      }
    } else {
      throw new Error("Not a object reference");
    }

    return ret;
  }

}