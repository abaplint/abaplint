import {ClassDefinition} from "../types";
import {AnyType, CharacterType, CLikeType, CSequenceType, DataReference, DateType, DecFloat16Type, DecFloat34Type, DecFloatType, FloatingPointType, FloatType, GenericObjectReferenceType, HexType, IntegerType, NumericGenericType, NumericType, ObjectReferenceType, PackedType, StringType, StructureType, TableType, TimeType, UnknownType, VoidType, XStringType} from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";
import {CurrentScope} from "./_current_scope";

export class TypeUtils {
  // scope is needed to determine class hieraracy for typing
  private readonly scope: CurrentScope;

  public constructor(scope: CurrentScope) {
    this.scope = scope;
  }

  public isCharLike(type: AbstractType | undefined): boolean {
    if (type === undefined) {
      return false;
    } else if (type instanceof TableType && type.isWithHeader()) {
      return this.isCharLike(type.getRowType());
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
        || type instanceof IntegerType
        || type instanceof FloatType
        || type instanceof FloatingPointType
        || type instanceof DecFloatType
        || type instanceof DecFloat16Type
        || type instanceof DecFloat34Type
        || type instanceof NumericGenericType
        || type instanceof CSequenceType
        || type instanceof DateType
        || type instanceof CLikeType
        || type instanceof PackedType
        || type instanceof TimeType
        || type instanceof CharacterType) {
      return true;
    }
    return false;
  }

  public isHexLike(type: AbstractType | undefined): boolean {
    if (type === undefined) {
      return false;
    } else if (type instanceof StructureType) {
      for (const c of type.getComponents()) {
        if (this.isHexLike(c.type) === false) {
          return false;
        }
      }
      return true;
    } else if (type instanceof XStringType
        || type instanceof HexType
        || type instanceof VoidType
        || type instanceof AnyType
        || type instanceof UnknownType) {
      return true;
    }
    return false;
  }

  public isOOAssignable(source: ObjectReferenceType, target: ObjectReferenceType): boolean {
    const sid = source.getIdentifier();
    const tid = target.getIdentifier();
    if (sid instanceof ClassDefinition && tid instanceof ClassDefinition) {
      const tname = tid.getName().toUpperCase();
      if (sid.getName().toUpperCase() === tname) {
// quick and easy,
        return true;
      }

      const slist = this.listAllSupers(sid);
      if (slist.indexOf(tname) >= 0) {
        return true;
      }
    }
    return false;
  }

  private listAllSupers(cdef: ClassDefinition): string[] {
    const ret: string[] = [];
    let sup = cdef.getSuperClass();
    while (sup !== undefined) {
      ret.push(sup?.toUpperCase());
      sup = this.scope.findClassDefinition(sup)?.getSuperClass()?.toUpperCase();
    }
    return ret;
  }

  public isAssignable(source: AbstractType | undefined, target: AbstractType | undefined): boolean {
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
    } else if (target instanceof ObjectReferenceType && source instanceof ObjectReferenceType) {
      return this.isOOAssignable(source, target);
    } else if (target instanceof ObjectReferenceType
        || target instanceof GenericObjectReferenceType) {
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
      } else if (target.containsVoid() === true) {
        return true;
      } else if (source instanceof IntegerType) {
        return false;
      } else if (this.isCharLike(target) && this.isCharLike(source)) {
        return true;
      }
      return false;
    } else if (target instanceof IntegerType
        || target instanceof StringType) {
      if (source instanceof TableType && source.isWithHeader() === false) {
        return false;
      } else if (source instanceof DataReference
          || source instanceof ObjectReferenceType
          || source instanceof GenericObjectReferenceType) {
        return false;
      }
      return true;
    }

    return true;
  }
}