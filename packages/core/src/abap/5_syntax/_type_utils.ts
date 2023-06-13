import {ClassDefinition, InterfaceDefinition} from "../types";
import {AnyType, CharacterType, CLikeType, CSequenceType, DataReference, DateType, DecFloat16Type, DecFloat34Type, DecFloatType, FloatingPointType, FloatType, GenericObjectReferenceType, HexType, Integer8Type, IntegerType, NumericGenericType, NumericType, ObjectReferenceType, PackedType, SimpleType, StringType, StructureType, TableType, TimeType, UnknownType, VoidType, XGenericType, XSequenceType, XStringType} from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";
import {CGenericType} from "../types/basic/cgeneric_type";
import {CurrentScope} from "./_current_scope";

export class TypeUtils {
  // scope is needed to determine class hieraracy for typing
  private readonly scope: CurrentScope;

  public constructor(scope: CurrentScope) {
    this.scope = scope;
  }

  public isCharLikeStrict(type: AbstractType | undefined): boolean {
    if (type === undefined) {
      return false;
    } else if (type instanceof StructureType) {
      for (const c of type.getComponents()) {
        if (this.isCharLikeStrict(c.type) === false) {
          return false;
        }
      }
      return true;
    } else if (type instanceof StringType
        || type instanceof AnyType
        || type instanceof CharacterType
        || type instanceof SimpleType
        || type instanceof CGenericType
        || type instanceof CLikeType
        || type instanceof DateType
        || type instanceof CSequenceType
        || type instanceof NumericGenericType
        || type instanceof NumericType
        || type instanceof TimeType
        || type instanceof UnknownType
        || type instanceof VoidType) {
      return true;
    }
    return false;
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
        || type instanceof CharacterType
        || type instanceof VoidType
        || type instanceof AnyType
        || type instanceof UnknownType
        || type instanceof NumericType
        || type instanceof IntegerType
        || type instanceof Integer8Type
        || type instanceof SimpleType
        || type instanceof FloatType
        || type instanceof FloatingPointType
        || type instanceof DecFloatType
        || type instanceof DecFloat16Type
        || type instanceof DecFloat34Type
        || type instanceof NumericGenericType
        || type instanceof CSequenceType
        || type instanceof CGenericType
        || type instanceof DateType
        || type instanceof CLikeType
        || type instanceof PackedType
        || type instanceof TimeType) {
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
        || type instanceof XGenericType
        || type instanceof XSequenceType
        || type instanceof AnyType
        || type instanceof UnknownType) {
      return true;
    }
    return false;
  }

  public isOOAssignable(source: ObjectReferenceType, target: ObjectReferenceType): boolean {
    let sid = source.getIdentifier();
    let tid = target.getIdentifier();

    const tname = tid.getName().toUpperCase();
    const sname = sid.getName().toUpperCase();

    if (tname === sname) {
      return true;
    }

    if (!(sid instanceof ClassDefinition || sid instanceof InterfaceDefinition)) {
      const found = this.scope.findObjectDefinition(sid.getName());
      if (found) {
        sid = found;
      } else {
        return false;
      }
    }

    if (!(tid instanceof ClassDefinition || tid instanceof InterfaceDefinition)) {
      const found = this.scope.findObjectDefinition(tid.getName());
      if (found) {
        tid = found;
      } else {
        return false;
      }
    }

    if (sid instanceof ClassDefinition && tid instanceof ClassDefinition) {
      if (sname === tname) {
        return true;
      }
      const slist = this.listAllSupers(sid);
      if (slist.indexOf(tname) >= 0) {
        return true;
      }
    } else if (sid instanceof ClassDefinition && tid instanceof InterfaceDefinition) {
      if (sid.getImplementing().some(i => i.name === tname) ) {
        return true;
      }
      const slist = this.listAllInterfaces(sid);
      if (slist.indexOf(tname) >= 0) {
        return true;
      }
    } else if (sid instanceof InterfaceDefinition && tid instanceof InterfaceDefinition) {
      if (sname === tname) {
        return true;
      }
      if (sid.getImplementing().some(i => i.name === tname) ) {
        return true;
      }
      const slist = this.listAllInterfaces(sid);
      if (slist.indexOf(tname) >= 0) {
        return true;
      }
    }
    return false;
  }

  private listAllInterfaces(cdef: ClassDefinition | InterfaceDefinition): string[] {
    const ret = new Set<string>();
    const stack: string[] = [];

    // initialize
    cdef.getImplementing().forEach(i => stack.push(i.name));
    if (cdef instanceof ClassDefinition) {
      const supers = this.listAllSupers(cdef);
      for (const s of supers) {
        this.scope.findClassDefinition(s)?.getImplementing().forEach(i => stack.push(i.name));
      }
    }

    // main loop
    while (stack.length > 0) {
      const intf = stack.pop()!.toUpperCase();
      ret.add(intf);

      const idef = this.scope.findInterfaceDefinition(intf);
      idef?.getImplementing().forEach(i => stack.push(i.name));
    }

    return Array.from(ret.values());
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

  public isCastable(_source: AbstractType | undefined, _target: AbstractType | undefined): boolean {
// todo
    return true;
  }

  private structureContainsString(structure: StructureType): boolean {
    for (const c of structure.getComponents()) {
      if (c.type instanceof StringType) {
        return true;
      }
    }
    return false;
  }

  private structureContainsVoid(structure: StructureType): boolean {
    for (const c of structure.getComponents()) {
      if (c.type instanceof VoidType) {
        return true;
      }
    }
    return false;
  }

  public isAssignableStrict(source: AbstractType | undefined,
                            target: AbstractType | undefined,
                            calculated: boolean = false): boolean {
/*
    console.dir(source);
    console.dir(target);
*/
    if (calculated) {
      return this.isAssignable(source, target);
    }

    if (source instanceof CharacterType) {
      if (target instanceof CharacterType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return source.getLength() <= target.getLength();
        }
        return source.getLength() === target.getLength();
      } else if (target instanceof IntegerType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return true;
        }
        return false;
      } else if (target instanceof StringType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return true;
        }
        return false;
      }
    } else if (source instanceof HexType) {
      if (target instanceof HexType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return source.getLength() <= target.getLength();
        }
        return source.getLength() === target.getLength();
      } else if (target instanceof IntegerType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return true;
        }
        return false;
      }
    } else if (source instanceof StringType) {
      if (target instanceof StructureType && this.structureContainsString(target)) {
        return false;
      } else if (target instanceof IntegerType) {
        return false;
      } else if (target instanceof XSequenceType || target instanceof XStringType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return true;
        }
        return false;
      }
      return true;
    } else if (source instanceof StructureType && target instanceof StructureType) {
      const sourceComponents = source.getComponents();
      const targetComponents = target.getComponents();
      if (sourceComponents.length !== targetComponents.length) {
        return false;
      }
      for (let i = 0; i < sourceComponents.length; i++) {
        if (this.isAssignableStrict(sourceComponents[i].type, targetComponents[i].type) === false) {
          return false;
        }
      }
      return true;
    } else if (source instanceof Integer8Type) {
      if (target instanceof IntegerType || target instanceof StringType) {
        return false;
      }
    } else if (source instanceof FloatType) {
      if (target instanceof IntegerType) {
        return false;
      }
    } else if (source instanceof XStringType) {
      if (target instanceof CLikeType) {
        return false;
      }
    }
    return this.isAssignable(source, target);
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
      if (source instanceof VoidType
          || source instanceof AnyType
          || source instanceof UnknownType) {
        return true;
      } else if (source instanceof TableType) {
        const targetRowType = target.getRowType();
        const sourceRowType = source.getRowType();
        if (targetRowType instanceof VoidType || targetRowType instanceof AnyType || targetRowType instanceof UnknownType) {
          return true;
        } else if (sourceRowType instanceof VoidType || sourceRowType instanceof AnyType || sourceRowType instanceof UnknownType) {
          return true;
        }
        if (targetRowType instanceof StructureType
            && this.structureContainsString(targetRowType)) {
          if (!(sourceRowType instanceof StructureType)) {
            return false;
          } else if (!(this.structureContainsString(sourceRowType))
              && this.structureContainsVoid(sourceRowType) === false) {
            return false;
          }
        } else if (sourceRowType instanceof StructureType
            && this.structureContainsString(sourceRowType)) {
          if (!(targetRowType instanceof StructureType)) {
            return false;
          } else if (!(this.structureContainsString(targetRowType))
          && this.structureContainsVoid(targetRowType) === false) {
            return false;
          }
        }
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
      } else if (source instanceof VoidType
          || source instanceof AnyType
          || source instanceof UnknownType) {
        return true;
      } else if (source instanceof StructureType) {
        if (this.structureContainsString(target) && !this.structureContainsString(source)) {
          return false;
        }
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