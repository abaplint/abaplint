import {AnyType, CharacterType, CLikeType, DataReference, DateType, GenericObjectReferenceType, IntegerType, NumericType, ObjectReferenceType, PackedType, StringType, StructureType, TableType, TimeType, UnknownType, VoidType} from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";

export class TypeUtils {
  // public static isHexLike, todo

  public static isCharLike(type: AbstractType | undefined): boolean {
    if (type === undefined) {
      return false;
    } else if (type instanceof StructureType) {
      for (const c of type.getComponents()) {
        if (this.isCharLike(c.type) === false) {
          return false;
        }
      }
      return true;
    } else if (type instanceof StringType
        || type instanceof VoidType
        || type instanceof AnyType
        || type instanceof UnknownType
        || type instanceof NumericType
        || type instanceof DateType
        || type instanceof CLikeType
        || type instanceof PackedType
        || type instanceof TimeType
        || type instanceof CharacterType) {
      return true;
    }
    return false;
  }

  public static isAssignable(source: AbstractType | undefined, target: AbstractType | undefined): boolean {
/*
    console.dir(source);
    console.dir(target);
*/
    if (target instanceof TableType) {
      if (target.isWithHeader()) {
        return this.isAssignable(source, target.getRowType());
      }
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
    } else if (target instanceof DataReference) {
      if (source instanceof DataReference
          || source instanceof VoidType
          || source instanceof AnyType
          || source instanceof UnknownType) {
        return true;
      }
      return false;
    } else if (target instanceof StructureType) {
      if (source instanceof TableType && source.isWithHeader()) {
        return this.isAssignable(source.getRowType(), target);
      } else if (source instanceof StructureType
          || source instanceof VoidType
          || source instanceof AnyType
          || source instanceof UnknownType) {
        return true;
      } else if (this.isCharLike(target)
          && (this.isCharLike(source) || source instanceof IntegerType)) {
        return true;
      }
      return false;
    } else if (target instanceof IntegerType) {
      if (source instanceof DataReference
          || source instanceof ObjectReferenceType
          || source instanceof GenericObjectReferenceType
          || source instanceof TableType) {
        return false;
      }
      return true;
    }

    return true;
  }
}