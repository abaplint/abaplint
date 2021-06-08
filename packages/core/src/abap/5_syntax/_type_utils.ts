import {AnyType, GenericObjectReferenceType, ObjectReferenceType, TableType, UnknownType, VoidType} from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";

export class TypeUtils {
  public static isAssignable(source: AbstractType | undefined, target: AbstractType | undefined): boolean {
    /*
    console.dir(source);
    console.dir(target);
*/
    if (target instanceof TableType) {
      if (source instanceof TableType
          || source instanceof VoidType
          || source instanceof AnyType
          || source instanceof UnknownType) {
        return true;
      }
      return false;
    } else if (target instanceof ObjectReferenceType || target instanceof GenericObjectReferenceType) {
      if (source instanceof ObjectReferenceType
          || source instanceof GenericObjectReferenceType
          || source instanceof VoidType
          || source instanceof AnyType
          || source instanceof UnknownType) {
        return true;
      }
      return false;
    }

    return true;
  }
}