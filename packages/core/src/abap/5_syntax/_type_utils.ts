import {ClassDefinition, InterfaceDefinition} from "../types";
import {AnyType, CharacterType, CLikeType, CSequenceType, DataReference, DataType, DateType, DecFloat16Type, DecFloat34Type, DecFloatType, FloatingPointType, FloatType, GenericObjectReferenceType, HexType, Integer8Type, IntegerType, NumericGenericType, NumericType, ObjectReferenceType, PackedType, PGenericType, SimpleType, StringType, StructureType, TableType, TimeType, UnknownType, UTCLongType, VoidType, XGenericType, XSequenceType, XStringType} from "../types/basic";
import {TableAccessType, TableKeyType} from "../types/basic/table_type";
import {EnumType} from "../types/basic/enum_type";
import {AbstractType} from "../types/basic/_abstract_type";
import {CGenericType} from "../types/basic/cgeneric_type";
import {CurrentScope} from "./_current_scope";
import * as Expressions from "../2_statements/expressions";
import {ExpressionNode, TokenNodeRegex} from "../nodes";
import {NGenericType} from "../types/basic/ngeneric_type";
import {BuiltIn} from "./_builtin";

// todo: refactor to static? for performance
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
    } else if (type instanceof TableType && type.isWithHeader()) {
      return this.isCharLikeStrict(type.getRowType());
    } else if (type instanceof StringType
        || type instanceof AnyType
        || type instanceof DataType
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

  public isCharLikeField(type: AbstractType | undefined): boolean {
    if (type instanceof StructureType
        || (type instanceof TableType && type.isWithHeader())) {
      return this.isCharLikeStrict(type);
    }
    return type instanceof CharacterType
      || type instanceof NumericType
      || type instanceof DateType
      || type instanceof TimeType
      || type instanceof CGenericType
      || type instanceof CLikeType
      || type instanceof AnyType
      || type instanceof UnknownType
      || type instanceof VoidType;
  }

  public isCharLikeForCompare(type: AbstractType | undefined): boolean {
    return type === undefined
      || type instanceof StringType
      || type instanceof CLikeType
      || type instanceof CSequenceType
      || type instanceof DataType
      || this.isCharLikeField(type);
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
        || type instanceof DataType
        || type instanceof CLikeType
        || type instanceof PackedType
        || type instanceof PGenericType
        || type instanceof TimeType
        || type instanceof EnumType) {
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
    } else if (type instanceof TableType && type.isWithHeader()) {
      return this.isHexLike(type.getRowType());
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
/*
    console.dir(sid);
    console.dir(tid);
*/
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
      if (sid.getImplementing().some(i => i.name === tname)) {
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
      if (sid.getImplementing().some(i => i.name === tname)) {
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

  public isConvable(source: AbstractType | undefined, target: AbstractType | undefined): boolean {

    if (source instanceof TableType && target instanceof TableType) {
// table key conversion, eg DEFAULT to EMPTY
      return this.isAssignable(source.getRowType(), target.getRowType());
    }

    return this.isAssignable(source, target);
  }

  public isCastable(_source: AbstractType | undefined, _target: AbstractType | undefined): boolean {
// todo
    return true;
  }

  public isCompareable(source1: AbstractType | undefined, source2: AbstractType | undefined,
                       node1: ExpressionNode, node2: ExpressionNode): boolean {
    /*
    console.dir(source1);
    console.dir(source2);
    */
    if (source1 === undefined || source2 === undefined) {
      return true;
    }

    if (source1 instanceof HexType && this.isCalculated(node1) && source2 instanceof IntegerType) {
      return false;
    }
    if (source2 instanceof HexType && this.isCalculated(node2) && source1 instanceof IntegerType) {
      return false;
    }

    if (source1 instanceof DateType && this.isCalculated(node2) && source2 instanceof IntegerType) {
      return false;
    }
    if (source2 instanceof DateType && this.isCalculated(node1) && source1 instanceof IntegerType) {
      return false;
    }

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

  private isCalculated(node: ExpressionNode): boolean {
    /*
    if (node.getChildren().length === 1
        && node.get() instanceof Expressions.Source
        && node.getFirstChild()?.get() instanceof Expressions.MethodCallChain) {
      return false;
    }
    */

    if (node.getChildren().length === 4
        && node.getFirstChild() instanceof TokenNodeRegex
        && node.getFirstChild()?.concatTokens().toUpperCase() === "BOOLC") {
      return true;
    }

    if (node.getChildren().length >= 3) {
      const second = node.getChildren()[1];
      if (second.getFirstToken().getStr() === "&&") {
        return true;
      }
    }

    const calculated = node.findFirstExpression(Expressions.MethodCallChain) !== undefined
      || node.findFirstExpression(Expressions.StringTemplate) !== undefined
      || node.findFirstExpression(Expressions.ArithOperator) !== undefined;
    return calculated;
  }

  /** the source is only a call of a functional method, not a built-in function */
  private isFunctionalMethodResult(node: ExpressionNode): boolean {
    if (!(node.get() instanceof Expressions.Source) || node.getChildren().length !== 1) {
      return false;
    }
    const chain = node.getFirstChild();
    if (!(chain instanceof ExpressionNode) || !(chain.get() instanceof Expressions.MethodCallChain)) {
      return false;
    }
    const children = chain.getChildren();
    const last = children[children.length - 1];
    if (!(last instanceof ExpressionNode) || !(last.get() instanceof Expressions.MethodCall)) {
      return false;
    }
    if (children.length === 1) {
      const name = last.findDirectExpression(Expressions.MethodName)?.concatTokens().toUpperCase();
      if (name === undefined || BuiltIn.searchBuiltin(name) !== undefined) {
        return false;
      }
    }
    return true;
  }

  /** the result of a functional method passed to a formal parameter: the result is expected to be of
   * the same kind as the parameter, numeric types mix, c, n and x only into the same or a longer length.
   * Returns false for a known mismatch of elementary types, true otherwise */
  private isFunctionalResultAssignable(source: AbstractType | undefined, target: AbstractType | undefined): boolean {
    const isNumber = (t: AbstractType | undefined) => t instanceof IntegerType
      || t instanceof Integer8Type
      || t instanceof PackedType
      || t instanceof FloatType
      || t instanceof DecFloat16Type
      || t instanceof DecFloat34Type;

    let kind: string;
    if (isNumber(source)) {
      kind = "number";
    } else if (source instanceof CharacterType) {
      kind = "c";
    } else if (source instanceof NumericType && !(source instanceof NGenericType)) {
      kind = "n";
    } else if (source instanceof HexType) {
      kind = "x";
    } else if (source instanceof StringType) {
      kind = "string";
    } else if (source instanceof XStringType) {
      kind = "xstring";
    } else if (source instanceof DateType) {
      kind = "d";
    } else if (source instanceof TimeType) {
      kind = "t";
    } else if (source instanceof UTCLongType) {
      kind = "utclong";
    } else {
      return true;
    }

    if (isNumber(target) || target instanceof NumericGenericType || target instanceof PGenericType) {
      return kind === "number";
    } else if (target instanceof CharacterType) {
      return source instanceof CharacterType && source.getLength() <= target.getLength();
    } else if (target instanceof NGenericType) {
      return kind === "n";
    } else if (target instanceof NumericType) {
      return source instanceof NumericType && source.getLength() <= target.getLength();
    } else if (target instanceof HexType) {
      return source instanceof HexType && source.getLength() <= target.getLength();
    } else if (target instanceof StringType) {
      return kind === "c" || kind === "string";
    } else if (target instanceof XStringType) {
      return kind === "x" || kind === "xstring";
    } else if (target instanceof DateType) {
      return kind === "d";
    } else if (target instanceof TimeType) {
      return kind === "t";
    } else if (target instanceof UTCLongType) {
      return kind === "utclong";
    } else if (target instanceof CGenericType) {
      return kind === "c";
    } else if (target instanceof XGenericType) {
      return kind === "x";
    } else if (target instanceof CSequenceType) {
      return kind === "c" || kind === "string";
    } else if (target instanceof XSequenceType) {
      return kind === "x" || kind === "xstring";
    } else if (target instanceof CLikeType) {
      return kind !== "number" && kind !== "x" && kind !== "xstring" && kind !== "utclong";
    }
    return true;
  }

  // a text or string literal is only assignable to an xstring or xsequence parameter if its
  // content is hexadecimal: one or more of 0-9 and A-F, upper case, nothing else, or ``
  private isHexConstant(node: ExpressionNode | undefined): boolean {
    const constant = node?.concatTokens();
    if (constant === undefined) {
      return true;
    }
    if ((constant.startsWith("'") && constant.endsWith("'"))
        || (constant.startsWith("`") && constant.endsWith("`"))) {
      const value = constant.substring(1, constant.length - 1);
      // an empty string literal is an empty byte string, while '' is a text field of one blank
      return /^[0-9A-F]+$/.test(value) || constant === "``";
    }
    return true;
  }

  public isAssignableNew(source: AbstractType | undefined,
                         target: AbstractType | undefined,
                         node: ExpressionNode | undefined): boolean {
    const calculated = node?.findFirstExpression(Expressions.ArithOperator) !== undefined;

    if (calculated && source instanceof HexType && target instanceof IntegerType) {
      return false;
    }

    return this.isAssignable(source, target);
  }

  public isAssignableStrict(source: AbstractType | undefined,
                            target: AbstractType | undefined,
                            node?: ExpressionNode,
                            builtin = false): boolean {
    const calculated = node ? this.isCalculated(node) : false;
/*
    console.dir(source);
    console.dir(target);
    console.dir(calculated);
*/
    if (calculated && source instanceof StringType
        && (target instanceof XStringType || target instanceof XSequenceType)) {
      return false;
    }

    if (calculated && source instanceof IntegerType && target instanceof DateType) {
      return false;
    }

    if (target instanceof NumericType
        && (source instanceof CharacterType || source instanceof StringType)
        && source.getAbstractTypeData()?.derivedFromConstant === true) {
      const constant = node?.concatTokens();
      if (constant !== undefined
          && ((constant.startsWith("'") && constant.endsWith("'"))
            || (constant.startsWith("`") && constant.endsWith("`")))
          && /^\d*$/.test(constant.substring(1, constant.length - 1)) === false) {
        return false;
      }
    }

    const functionalResult = node !== undefined && builtin === false && this.isFunctionalMethodResult(node);
    if (functionalResult && this.isFunctionalResultAssignable(source, target) === false) {
      return false;
    }

    // a structure, table or reference returned by a functional method follows the same rule as a variable
    const strictResult = functionalResult && (source instanceof StructureType
      || source instanceof TableType
      || source instanceof DataReference
      || source instanceof ObjectReferenceType
      || source instanceof GenericObjectReferenceType);
    if (calculated && strictResult === false) {
      return this.isAssignable(source, target);
    }

    // an elementary text field is not compatible with a structure, also not with a flat character-like one
    if (target instanceof StructureType
        && target.containsVoid() === false
        && (source instanceof CharacterType || source instanceof StringType || source instanceof NumericType)) {
      return false;
    }

    if (target instanceof CLikeType) {
      return this.isCharLikeStrict(source);
    }

    if (target instanceof PGenericType) {
      return source instanceof PackedType
        || source instanceof PGenericType
        || source instanceof VoidType
        || source instanceof AnyType
        || source instanceof DataType
        || source instanceof UnknownType;
    }

    if (source instanceof CGenericType && target instanceof StringType) {
      return false;
    } else if (source instanceof CharacterType) {
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
      } else if (target instanceof XStringType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return this.isHexConstant(node);
        }
        return false;
      } else if (target instanceof XSequenceType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return this.isHexConstant(node);
        }
        return true;
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
      } else if (target instanceof XStringType) {
        return false;
      } else if (target instanceof IntegerType || target instanceof Integer8Type) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return true;
        }
        return false;
      }
    } else if (source instanceof DateType || source instanceof TimeType) {
      if (target instanceof CharacterType || target instanceof StringType) {
        return false;
      }
    } else if (source instanceof StringType) {
      if (target instanceof StructureType && this.structureContainsString(target)) {
        return false;
      } else if (target instanceof CharacterType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return true;
        }
        return false;
      } else if (target instanceof IntegerType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return true;
        }
        return false;
      } else if (target instanceof CGenericType
          || target instanceof GenericObjectReferenceType) {
        return false;
      } else if (target instanceof XSequenceType || target instanceof XStringType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return this.isHexConstant(node);
        }
        return false;
      } else if (target instanceof TableType
          || target instanceof DataReference
          || target instanceof ObjectReferenceType) {
        return false;
      }
      return true;
    } else if (source instanceof StructureType) {
      if (target instanceof StructureType) {
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
      } else if (target instanceof SimpleType) {
        return this.isCharLikeStrict(source);
      } else if (target instanceof CLikeType) {
        return this.isCharLikeStrict(source);
      } else if (target instanceof VoidType
          || target instanceof AnyType
          || target instanceof DataType
          || target instanceof UnknownType) {
        return true;
      }
      return false;
    } else if (source instanceof Integer8Type) {
      if (target instanceof IntegerType
          || target instanceof StringType
          || target instanceof FloatType) {
        return false;
      }
    } else if (source instanceof IntegerType) {
      if (target instanceof StringType
          || target instanceof DateType
          || target instanceof CharacterType) {
        return false;
      } else if (target instanceof Integer8Type || target instanceof PackedType) {
        if (source.getAbstractTypeData()?.derivedFromConstant === true) {
          return true;
        }
        return false;
      }
    } else if (source instanceof PackedType && target instanceof PackedType) {
      return source.getLength() === target.getLength()
        && source.getDecimals() === target.getDecimals();
    } else if (source instanceof FloatType) {
      if (target instanceof IntegerType) {
        return false;
      }
    } else if (source instanceof GenericObjectReferenceType) {
      if (target instanceof ObjectReferenceType
          || target instanceof StringType
          || target instanceof CharacterType
          || target instanceof TableType
          || target instanceof CLikeType) {
        return false;
      }
    } else if (source instanceof ObjectReferenceType) {
      if (target instanceof XSequenceType
          || target instanceof IntegerType
          || target instanceof StructureType
          || target instanceof TableType
          || target instanceof XStringType) {
        return false;
      }
    } else if (source instanceof XStringType) {
      if (target instanceof CharacterType
          || target instanceof CLikeType
          || target instanceof IntegerType
          || target instanceof StringType
          || target instanceof ObjectReferenceType
          || target instanceof HexType) {
        return false;
      }
    } else if (source instanceof DataReference && target instanceof DataReference) {
      return this.isDataReferenceCompatible(source, target);
    } else if (source instanceof TableType) {
      if (target instanceof TableType && this.isTableKindCompatible(source, target) === false) {
        return false;
      } else if (source.getRowType() instanceof AnyType) {
        // then its a generic table, todo: add top level generic table type?
        return true;
      } else if (target instanceof TableType && target.getRowType() instanceof AnyType) {
        // then its a generic table, todo: add top level generic table type?
        return true;
      } else if (target instanceof TableType) {
        const sourceKeyType = source.getOptions().keyType;
        const targetKeyType = target.getOptions().keyType;
        if (sourceKeyType !== targetKeyType
            && sourceKeyType !== TableKeyType.user
            && targetKeyType !== TableKeyType.user) {
          return false;
        }
        if (sourceKeyType === TableKeyType.empty && targetKeyType !== TableKeyType.empty
            && !(target.getRowType() instanceof AnyType)) {
          return false;
        }
        return this.isAssignableStrict(source.getRowType(), target.getRowType());
      } else if (target instanceof UnknownType
          || target instanceof AnyType
          || target instanceof VoidType) {
        return true;
      }
    }
    return this.isAssignable(source, target);
  }

  // a standard, sorted or hashed table only fits a table type of the same kind, generic or not,
  // INDEX TABLE takes standard and sorted tables, ANY TABLE takes all
  private isTableKindCompatible(source: TableType, target: TableType): boolean {
    const sourceAccess = source.getAccessType();
    const targetAccess = target.getAccessType();
    if (sourceAccess === undefined
        || targetAccess === undefined
        || sourceAccess === TableAccessType.index
        || sourceAccess === TableAccessType.any
        || source.isWithHeader()
        || target.isWithHeader()) {
      return true;
    } else if (targetAccess === TableAccessType.any) {
      return true;
    } else if (targetAccess === TableAccessType.index) {
      return sourceAccess !== TableAccessType.hashed;
    }
    return sourceAccess === targetAccess;
  }

  // a data reference fits REF TO data, or a reference to the same type, no down cast
  private isDataReferenceCompatible(source: DataReference, target: DataReference): boolean {
    const targetType = target.getType();
    const sourceType = source.getType();
    if (targetType instanceof DataType || targetType instanceof AnyType || target.isGeneric()) {
      return true;
    } else if (sourceType instanceof DataType || sourceType instanceof AnyType) {
      return false;
    }
    return this.isSameType(sourceType, targetType);
  }

  // types of the same kind and technical attributes, structures also with the same component names;
  // returns true whenever this cannot be decided
  private isSameType(source: AbstractType, target: AbstractType): boolean {
    if (source instanceof VoidType || target instanceof VoidType
        || source instanceof UnknownType || target instanceof UnknownType
        || source instanceof AnyType || target instanceof AnyType
        || source.containsVoid() || target.containsVoid()) {
      return true;
    } else if (source.constructor !== target.constructor) {
      return false;
    }

    if ((source instanceof CharacterType && target instanceof CharacterType)
        || (source instanceof HexType && target instanceof HexType)
        || (source instanceof NumericType && target instanceof NumericType)) {
      return source.getLength() === target.getLength();
    } else if (source instanceof PackedType && target instanceof PackedType) {
      return source.getLength() === target.getLength() && source.getDecimals() === target.getDecimals();
    } else if (source instanceof StructureType && target instanceof StructureType) {
      const sourceComponents = source.getComponents();
      const targetComponents = target.getComponents();
      if (sourceComponents.length !== targetComponents.length) {
        return false;
      }
      for (let i = 0; i < sourceComponents.length; i++) {
        if (sourceComponents[i].name.toUpperCase() !== targetComponents[i].name.toUpperCase()
            || this.isSameType(sourceComponents[i].type, targetComponents[i].type) === false) {
          return false;
        }
      }
    } else if (source instanceof TableType && target instanceof TableType) {
      return source.getAccessType() === target.getAccessType()
        && this.isSameType(source.getRowType(), target.getRowType());
    } else if (source instanceof DataReference && target instanceof DataReference) {
      return this.isSameType(source.getType(), target.getType());
    }
    return true;
  }

  // character-like arguments of built-in functions must be elementary, flat character-like structures are not allowed
  public isAssignableBuiltin(source: AbstractType | undefined,
                             target: AbstractType | undefined,
                             node?: ExpressionNode): boolean {
    if (target instanceof CLikeType
        && (source instanceof StructureType
          || (source instanceof TableType && source.isWithHeader() && source.getRowType() instanceof StructureType))) {
      return false;
    }
    return this.isAssignableStrict(source, target, node, true);
  }

  // Typing with the classic STRUCTURE addition, ie. "FORM foo USING bar STRUCTURE zkey",
  // is not a compatibility check: ABAP only checks the fragment view up to the end of the
  // formal structure, so the actual parameter is allowed to be longer. For TABLES parameters
  // the table key is not part of the check at all.
  public isAssignableStructureTyping(source: AbstractType | undefined,
                                     target: AbstractType | undefined,
                                     node?: ExpressionNode): boolean {
    if (source instanceof StructureType && target instanceof StructureType) {
      const sourceComponents = source.getComponents();
      const targetComponents = target.getComponents();
      if (sourceComponents.length < targetComponents.length) {
        return false;
      }
      for (let i = 0; i < targetComponents.length; i++) {
        if (this.isAssignableStrict(sourceComponents[i].type, targetComponents[i].type) === false) {
          return false;
        }
      }
      return true;
    } else if (source instanceof TableType && target instanceof TableType) {
      return this.isAssignableStructureTyping(source.getRowType(), target.getRowType());
    } else if (source instanceof CharacterType && target instanceof StructureType) {
      // an elementary actual must be character-like, the formal structure purely character-like
      const length = this.characterLikeStructureLength(target);
      return length !== undefined && source.getLength() >= length;
    }

    return this.isAssignableStrict(source, target, node);
  }

  // returns the total length if the structure is flat and purely character-like, otherwise undefined
  private characterLikeStructureLength(type: StructureType): number | undefined {
    let length = 0;
    for (const component of type.getComponents()) {
      const t = component.type;
      if (t instanceof CharacterType || t instanceof NumericType) {
        length += t.getLength();
      } else if (t instanceof DateType) {
        length += 8;
      } else if (t instanceof TimeType) {
        length += 6;
      } else if (t instanceof StructureType) {
        const sub = this.characterLikeStructureLength(t);
        if (sub === undefined) {
          return undefined;
        }
        length += sub;
      } else {
        return undefined;
      }
    }
    return length;
  }

  public isAssignable(source: AbstractType | undefined, target: AbstractType | undefined): boolean {
    if (source === undefined || target === undefined) {
      return true;
    }

/*
    console.dir(source);
    console.dir(target);
*/
    if (source instanceof UTCLongType || target instanceof UTCLongType) {
      return this.isUTCLongAssignable(source, target);
    }

    if (target instanceof TableType) {
      if (target.isWithHeader()) {
        return this.isAssignable(source, target.getRowType());
      }
      if (source instanceof VoidType
          || source instanceof AnyType
          || source instanceof DataType
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
          } else if (!this.structureContainsString(sourceRowType)
              && this.structureContainsVoid(sourceRowType) === false) {
            return false;
          }
        } else if (sourceRowType instanceof StructureType
            && this.structureContainsString(sourceRowType)) {
          if (!(targetRowType instanceof StructureType)) {
            return false;
          } else if (!this.structureContainsString(targetRowType)
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
          || source instanceof DataType
          || source instanceof AnyType
          || source instanceof UnknownType) {
        return true;
      }
      return false;
    } else if (target instanceof DataReference) {
      if (source instanceof DataReference
          || source instanceof VoidType
          || source instanceof DataType
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
          || source instanceof DataType
          || source instanceof UnknownType) {
        return true;
      } else if (source instanceof StructureType) {
        const targetDeep = this.structureContainsString(target);
        const sourceDeep = this.structureContainsString(source);
        if (targetDeep && !sourceDeep) {
          return false;
        }

        const targetComponents = target.getComponents();
        const sourceComponents = source.getComponents();
        if (targetComponents.length !== sourceComponents.length) {
          if (targetDeep === true || sourceDeep === true) {
            return false;
          }
        }

        for (let i = 0; i < targetComponents.length; i++) {
          if (sourceComponents[i] === undefined) {
            continue;
          }
          // hmm
          if (sourceComponents[i].type instanceof StringType && !(targetComponents[i].type instanceof StringType)) {
            return false;
          } else if (!(sourceComponents[i].type instanceof StringType) && targetComponents[i].type instanceof StringType) {
            return false;
          }
        }

        return true;
      } else if (target.containsVoid() === true) {
        return true;
      } else if (source instanceof StringType && this.structureContainsString(target)) {
        return false;
      } else if (source instanceof IntegerType) {
        return false;
      } else if (this.isCharLike(target) && this.isCharLike(source)) {
        return true;
      }
      return false;
    } else if (target instanceof IntegerType
        || target instanceof CharacterType
        || target instanceof StringType) {
      if (source instanceof TableType && source.isWithHeader() === false) {
        return false;
      } else if ((target instanceof StringType || target instanceof CharacterType)
          && source instanceof StructureType
          && this.isCharLike(source)) {
        if (this.structureContainsString(source) === true) {
          return false;
        }
        return true;
      } else if (source instanceof StructureType) {
        return this.isCharLikeStrict(source);
      } else if (source instanceof DataReference
          || source instanceof ObjectReferenceType
          || source instanceof GenericObjectReferenceType) {
        return false;
      }
      return true;
    } else if (target instanceof SimpleType) {
      if (source instanceof ObjectReferenceType
          || source instanceof TableType) {
        return false;
      }
    }

    return true;
  }

  // utclong can only be converted to and from character like types
  private isUTCLongAssignable(source: AbstractType, target: AbstractType): boolean {
    if (this.isGenericOrVoid(source) || this.isGenericOrVoid(target)) {
      return true;
    } else if (source instanceof UTCLongType && target instanceof UTCLongType) {
      return true;
    } else if (source instanceof UTCLongType) {
      return this.isTextLike(target);
    }
    return this.isTextLike(source);
  }

  private isGenericOrVoid(type: AbstractType): boolean {
    return type instanceof VoidType
      || type instanceof AnyType
      || type instanceof DataType
      || type instanceof UnknownType;
  }

  private isTextLike(type: AbstractType): boolean {
    return type instanceof CharacterType
      || type instanceof StringType
      || type instanceof CLikeType
      || type instanceof CSequenceType
      || type instanceof CGenericType
      || type instanceof SimpleType;
  }
}
