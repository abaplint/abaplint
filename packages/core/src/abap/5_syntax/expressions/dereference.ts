import {AnyType, DataReference, DataType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";

export class Dereference {
  public runSyntax(type: AbstractType | undefined): AbstractType | undefined {
    if (type instanceof VoidType
        || type instanceof AnyType
        || type instanceof DataType
        || type === undefined
        || type instanceof UnknownType) {
      return type;
    }
    if (!(type instanceof DataReference)) {
      throw new Error("Not a data reference, cannot be dereferenced");
    }
    return type.getType();
  }
}