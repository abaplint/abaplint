import {INode} from "../../nodes/_inode";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {StructureType} from "../../types/basic/structure_type";
import {ObjectReferenceType} from "../../types/basic/object_reference_type";
import {ObjectOriented} from "../_object_oriented";
import {CurrentScope} from "../_current_scope";
import {DataReference} from "../../types/basic/data_reference_type";
import {ReferenceType} from "../_reference";
import {TypedIdentifier} from "../../types/_typed_identifier";

export class AttributeName {
  public runSyntax(
    context: AbstractType | undefined,
    node: INode,
    scope: CurrentScope,
    filename: string,
    type?: ReferenceType | undefined): AbstractType | undefined {

    if (context instanceof VoidType) {
      return context;
    }

    const helper = new ObjectOriented(scope);

    let ret: AbstractType | undefined = undefined;

    if (context instanceof ObjectReferenceType) {
      const def = scope.findObjectDefinition(context.getIdentifierName());
      if (def === undefined) {
        throw new Error("Definition for \"" + context.getIdentifierName() + "\" not found in scope");
      }
      const token = node.getFirstToken();
      const name = token.getStr();
      let found: TypedIdentifier | undefined = helper.searchAttributeName(def, name);
      if (found === undefined) {
        found = helper.searchConstantName(def, name);
      }
      if (found === undefined) {
        throw new Error("Attribute or constant \"" + name + "\" not found in \"" + def.getName() + "\"");
      }
      if (type) {
        scope.addReference(token, found, type, filename);
      }
      if (found && name.includes("~")) {
        const idef = scope.findInterfaceDefinition(name.split("~")[0]);
        if (idef) {
          scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, filename);
        }
      }
      ret = found.getType();
    } else if (context instanceof DataReference) {
      const sub = context.getType();
      const name = node.getFirstToken().getStr();
      if (name === "*") {
        return sub;
      }
      if (!(sub instanceof StructureType)) {
        throw new Error("Data reference not structured");
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