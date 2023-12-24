/* eslint-disable max-len */
import {TypedIdentifier, IdentifierMeta} from "../types/_typed_identifier";
import {VoidType, CharacterType, StructureType, IStructureComponent, IntegerType, NumericType, DateType, TimeType, StringType, FloatType, XStringType, TableType, AnyType, UTCLongType, CLikeType, TableKeyType, HexType, PackedType, XSequenceType} from "../types/basic";
import {Identifier as TokenIdentifier} from "../1_lexer/tokens";
import {Position} from "../../position";
import {AbstractType} from "../types/basic/_abstract_type";
import {IMethodDefinition} from "../types/_method_definition";
import {Visibility} from "../4_file_information/visibility";
import {Identifier} from "../4_file_information/_identifier";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {IMethodParameters} from "../types/_method_parameters";
import {Version} from "../../version";

interface IBuiltinMethod {
  counter: number,
  mandatory?: {[key: string]: AbstractType},
  optional?: {[key: string]: AbstractType},
  version?: Version,
  predicate?: boolean,
  return: AbstractType;
  cache?: BuiltInMethod | undefined;
}

export class BuiltInMethod extends Identifier implements IMethodDefinition, IMethodParameters {
  private readonly method: IBuiltinMethod;
  private readonly row: number;

  public constructor(token: AbstractToken, filename: string, method: IBuiltinMethod, row: number) {
    super(token, filename);
    this.method = method;
    this.row = row;
  }

  public getRequiredParameters(): readonly TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];
    for (const i in this.method.mandatory) {
      const id = new TokenIdentifier(new Position(this.row, 1), i);
      ret.push(new TypedIdentifier(id, BuiltIn.filename, this.method.mandatory[i]));
    }
    return ret;
  }

  public getOptional(): readonly string[] {
    throw new Error("BuiltInMethod->Method not implemented.");
  }

  public getAll(): readonly TypedIdentifier[] {
    throw new Error("BuiltInMethod->getAll, Method not implemented.");
  }

  public getImporting(): readonly TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];
    for (const i in this.method.mandatory) {
      const id = new TokenIdentifier(new Position(this.row, 1), i);
      ret.push(new TypedIdentifier(id, BuiltIn.filename, this.method.mandatory[i]));
    }
    for (const i in this.method.optional) {
      const id = new TokenIdentifier(new Position(this.row, 1), i);
      ret.push(new TypedIdentifier(id, BuiltIn.filename, this.method.optional[i]));
    }
    return ret;
  }

  public getDefaultImporting(): string | undefined {
    if (this.method.mandatory === undefined) {
      return undefined;
    }
    const keys = Object.keys(this.method.mandatory);
    if (keys.length === 1) {
      return keys[0].toUpperCase();
    }
    return undefined;
  }

  public getExporting(): readonly TypedIdentifier[] {
    return [];
  }

  public getRaising(): readonly string[] {
    return [];
  }

  public getChanging(): readonly TypedIdentifier[] {
    return [];
  }

  public getReturning(): TypedIdentifier | undefined {
    const id = new TokenIdentifier(new Position(this.row, 1), "ret");
    return new TypedIdentifier(id, BuiltIn.filename, this.method.return);
  }

  public getExceptions(): readonly string[] {
    return [];
  }

  public getVisibility(): Visibility {
    return Visibility.Public;
  }

  public isRedefinition(): boolean {
    return false;
  }

  public isAbstract(): boolean {
    return false;
  }

  public isStatic(): boolean {
    return false;
  }

  public isEventHandler(): boolean {
    return false;
  }

  public getParameters(): IMethodParameters {
    return this;
  }

  public getParameterDefault(_parameter: string) {
    return undefined;
  }
}

export class BuiltIn {
  public static readonly filename = "_builtin.prog.abap";
  private static counter = 1;

  // todo: "pcre" vs "regex", only one of these parameters are allowed
  // todo: "pcre", only possible from 755
  public static readonly methods: {[name: string]: IBuiltinMethod} = {
    "ABS": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: IntegerType.get(),
    },

    "ACOS": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "ASIN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "ATAN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "BIT-SET": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": IntegerType.get(),
      },
      return: new XStringType(),
      version: Version.v702,
    },

    "BOOLC": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "BOOLX": {
      counter: BuiltIn.counter++,
      mandatory: {
        "bool": CLikeType.get(),
      },
      optional: {
        "bit": IntegerType.get(),
      },
      return: new XStringType(),
      version: Version.v702,
    },

    "CEIL": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: IntegerType.get(),
    },

    "CHAR_OFF": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
        "add": IntegerType.get(),
      },
      optional: {
        "off": IntegerType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "CHARLEN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      return: IntegerType.get(),
    },

    "CMAX": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val1": CLikeType.get(),
        "val2": CLikeType.get(),
      },
      optional: {
        "val3": CLikeType.get(),
        "val4": CLikeType.get(),
        "val5": CLikeType.get(),
        "val6": CLikeType.get(),
        "val7": CLikeType.get(),
        "val9": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "CMIN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val1": CLikeType.get(),
        "val2": CLikeType.get(),
      },
      optional: {
        "val3": CLikeType.get(),
        "val4": CLikeType.get(),
        "val5": CLikeType.get(),
        "val6": CLikeType.get(),
        "val7": CLikeType.get(),
        "val9": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "CONCAT_LINES_OF": {
      counter: BuiltIn.counter++,
      mandatory: {
        "table": new TableType(new AnyType(), {withHeader: false, keyType: TableKeyType.default}),
      },
      optional: {
        "sep": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "CONDENSE": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "del": CLikeType.get(),
        "from": CLikeType.get(),
        "to": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "CONTAINS": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "start": CLikeType.get(),
        "end": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: new CharacterType(1),
      predicate: true,
      version: Version.v702,
    },

    "CONTAINS_ANY_NOT_OF": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "start": CLikeType.get(),
        "end": CLikeType.get(),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      predicate: true,
      return: new CharacterType(1), version: Version.v702,
    },

    "CONTAINS_ANY_OF": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "start": CLikeType.get(),
        "end": CLikeType.get(),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: new CharacterType(1),
      predicate: true,
      version: Version.v702,
    },

    "COS": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "COSH": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "COUNT": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "COUNT_ANY_NOT_OF": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "COUNT_ANY_OF": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "DBMAXLEN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      return: IntegerType.get(),
    },

    "DISTANCE": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val1": CLikeType.get(),
        "val2": CLikeType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "ESCAPE": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
        "format": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "EXP": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "FIND": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "FIND_ANY_NOT_OF": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "FIND_ANY_OF": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "FIND_END": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "FLOOR": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: IntegerType.get(),
    },

    "FRAC": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: IntegerType.get(),
    },

    "FROM_MIXED": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get()},
      optional: {
        "case": new CharacterType(1),
        "sep": IntegerType.get(),
        "min": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "INSERT": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
        "sub": CLikeType.get(),
      },
      optional: {
        "off": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "IPOW": {
      counter: BuiltIn.counter++,
      mandatory: {
        "base": new FloatType(),
        "exp": new FloatType(),
      },
      return: IntegerType.get(),
      version: Version.v740sp02,
    },

    "LINE_EXISTS": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new AnyType(),
      },
      return: new CharacterType(1),
      predicate: true,
      version: Version.v740sp02,
    },

    "LINE_INDEX": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new AnyType(),
      },
      return: IntegerType.get(),
      version: Version.v740sp02,
    },

    "LINES": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new TableType(new AnyType(), {withHeader: false, keyType: TableKeyType.default}),
      },
      return: IntegerType.get(),
    },

    "LOG": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "LOG10": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "MATCH": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      }, optional: {
        "case": new CharacterType(1),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "occ": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "MATCHES": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "case": new CharacterType(1),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
      },
      return: new CharacterType(1),
      predicate: true,
      version: Version.v702,
    },

    "NMAX": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val1": CLikeType.get(),
        "val2": CLikeType.get(),
      },
      optional: {
        "val3": CLikeType.get(),
        "val4": CLikeType.get(),
        "val5": CLikeType.get(),
        "val6": CLikeType.get(),
        "val7": CLikeType.get(),
        "val8": CLikeType.get(),
        "val9": CLikeType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "NMIN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val1": CLikeType.get(),
        "val2": CLikeType.get(),
      },
      optional: {
        "val3": CLikeType.get(),
        "val4": CLikeType.get(),
        "val5": CLikeType.get(),
        "val6": CLikeType.get(),
        "val7": CLikeType.get(),
        "val8": CLikeType.get(),
        "val9": CLikeType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "NUMOFCHAR": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      return: IntegerType.get(),
    },

    "REPEAT": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
        "occ": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "REPLACE": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
        "with": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "off": IntegerType.get(),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "RESCALE": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      optional: {
        "dec": IntegerType.get(),
        "prec": IntegerType.get(),
        "mode": IntegerType.get(),
      },
      return: new FloatType(),
      version: Version.v702,
    },

    "REVERSE": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "ROUND": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      optional: {
        "dec": IntegerType.get(),
        "prec": IntegerType.get(),
        "mode": IntegerType.get(),
      },
      return: IntegerType.get(),
      version: Version.v702,
    },

    "SEGMENT": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
        "index": IntegerType.get(),
      },
      optional: {
        "sep": CLikeType.get(),
        "space": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "SHIFT_LEFT": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional:
      {
        "sub": CLikeType.get(),
        "places": IntegerType.get(),
        "circular": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "SHIFT_RIGHT": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "places": IntegerType.get(),
        "circular": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "SIGN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: IntegerType.get(),
    },

    "SIN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "SINH": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "SQRT": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "STRLEN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      return: IntegerType.get(),
    },

    "SUBSTRING": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "off": IntegerType.get(),
        "len": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "SUBSTRING_AFTER": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "SUBSTRING_BEFORE": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "SUBSTRING_FROM": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "SUBSTRING_TO": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional: {
        "sub": CLikeType.get(),
        "regex": CLikeType.get(),
        "pcre": CLikeType.get(),
        "case": new CharacterType(1),
        "len": IntegerType.get(),
        "occ": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "TAN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "TANH": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: new FloatType(),
    },

    "TO_LOWER": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "TO_MIXED": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      optional:
      {
        "case": new CharacterType(1),
        "sep": CLikeType.get(),
        "min": IntegerType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "TO_UPPER": {
      counter: BuiltIn.counter++,
      mandatory: {"val": CLikeType.get()},
      return: StringType.get(),
      version: Version.v702,
    },

    "TRANSLATE": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
        "from": CLikeType.get(),
        "to": CLikeType.get(),
      },
      return: StringType.get(),
      version: Version.v702,
    },

    "TRUNC": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new FloatType(),
      },
      return: IntegerType.get(),
    },

    "UTCLONG_ADD": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new UTCLongType(),
      },
      optional: {
        "days": IntegerType.get(),
        "hour": IntegerType.get(),
        "minutes": IntegerType.get(),
        "seconds": new FloatType(),
      },
      return: new UTCLongType(),
      version: Version.v754,
    },

    "UTCLONG_CURRENT": {
      counter: BuiltIn.counter++,
      return: new UTCLongType(),
      version: Version.v754,
    },

    "UTCLONG_DIFF": {
      counter: BuiltIn.counter++,
      mandatory: {
        "high": new UTCLongType(),
        "low": new UTCLongType(),
      },
      return: new FloatType(),
      version: Version.v754,
    },

    "XSDBOOL": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": CLikeType.get(),
      },
      return: new CharacterType(1),
      version: Version.v740sp08,
    },

    "XSTRLEN": {
      counter: BuiltIn.counter++,
      mandatory: {
        "val": new XSequenceType(),
      },
      return: IntegerType.get(),
    },
  };

  private row = 1;

  private buildDefinition(method: IBuiltinMethod, name: string): IMethodDefinition {
    if (method.cache) {
      return method.cache;
    }

    const token = new TokenIdentifier(new Position(1, 1), name);
    const result = new BuiltInMethod(token, BuiltIn.filename, method, method.counter);
    method.cache = result;
    return result;
  }

  public searchBuiltin(name: string | undefined): IMethodDefinition | undefined {
    if (name === undefined) {
      return undefined;
    }

    const def = BuiltIn.methods[name.toUpperCase()];
    if (def === undefined) {
      return undefined;
    }

    return this.buildDefinition(def, name);
  }

  public isPredicate(name: string | undefined): boolean | undefined {
    if (name === undefined) {
      return undefined;
    }

    const def = BuiltIn.methods[name.toUpperCase()];
    if (def === undefined) {
      return undefined;
    }

    return def.predicate;
  }

  public getTypes(): TypedIdentifier[] {
    const ret: TypedIdentifier[] = this.buildSY();

    {
      const id = new TokenIdentifier(new Position(1, 1), "abap_bool");
      ret.push(new TypedIdentifier(id, BuiltIn.filename, new CharacterType(1, {qualifiedName: "ABAP_BOOL", ddicName: "ABAP_BOOL"})));
    }

    {
      const id = new TokenIdentifier(new Position(1, 1), "cursor");
      ret.push(new TypedIdentifier(id, BuiltIn.filename, IntegerType.get({qualifiedName: "CURSOR", ddicName: "CURSOR"})));
    }

    return ret;
  }

  public get(extras: string[]): TypedIdentifier[] {
    const ret: TypedIdentifier[] = this.buildSY();

    ret.push(this.buildVariable("screen"));

    ret.push(this.buildConstant("%_ENDIAN"));
    ret.push(this.buildConstant("%_CHARSIZE"));

    ret.push(this.buildConstant("%_BACKSPACE", new CharacterType(1), "\b"));
    ret.push(this.buildConstant("%_CR_LF", new CharacterType(2), "\r\n"));
    ret.push(this.buildConstant("%_FORMFEED", new CharacterType(1), "\f"));
    ret.push(this.buildConstant("%_HORIZONTAL_TAB", new CharacterType(1), "\t"));
    ret.push(this.buildConstant("%_MAXCHAR", new CharacterType(1), Buffer.from("FDFF", "hex").toString()));
    ret.push(this.buildConstant("%_MINCHAR", new CharacterType(1), Buffer.from("0000", "hex").toString()));
    ret.push(this.buildConstant("%_NEWLINE", new CharacterType(1), "\n"));
    ret.push(this.buildConstant("%_VERTICAL_TAB", new CharacterType(1), "\v"));

    ret.push(this.buildConstant("abap_false", new CharacterType(1, {qualifiedName: "ABAP_BOOL", ddicName: "ABAP_BOOL"}), "' '"));
    ret.push(this.buildConstant("abap_true", new CharacterType(1, {qualifiedName: "ABAP_BOOL", ddicName: "ABAP_BOOL"}), "'X'"));
    ret.push(this.buildConstant("abap_undefined", new CharacterType(1, {qualifiedName: "ABAP_BOOL", ddicName: "ABAP_BOOL"}), "'-'"));
    ret.push(this.buildConstant("abap_off", new CharacterType(1, {qualifiedName: "ABAP_BOOL", ddicName: "ABAP_BOOL"}), "' '"));
    ret.push(this.buildConstant("abap_on", new CharacterType(1, {qualifiedName: "ABAP_BOOL", ddicName: "ABAP_BOOL"}), "'X'"));

    ret.push(this.buildConstant("col_background", IntegerType.get(), "0"));
    ret.push(this.buildConstant("col_heading", IntegerType.get(), "1"));
    ret.push(this.buildConstant("col_key", IntegerType.get(), "4"));
    ret.push(this.buildConstant("col_negative", IntegerType.get(), "6"));
    ret.push(this.buildConstant("col_group", IntegerType.get(), "7"));
    ret.push(this.buildConstant("col_normal", IntegerType.get(), "2"));
    ret.push(this.buildConstant("col_positive", IntegerType.get(), "5"));
    ret.push(this.buildConstant("col_total", IntegerType.get(), "3"));

    ret.push(this.buildConstant("space", new CharacterType(1, {derivedFromConstant: true}), "' '"));

    for (const e of extras) {
      const id = new TokenIdentifier(new Position(this.row++, 1), e);
      ret.push(new TypedIdentifier(id, BuiltIn.filename, new VoidType(e), [IdentifierMeta.ReadOnly, IdentifierMeta.BuiltIn], "'?'"));
    }

    return ret;
  }

  /////////////////////////////

  private buildVariable(name: string) {
    const id = new TokenIdentifier(new Position(this.row++, 1), name);
    return new TypedIdentifier(id, BuiltIn.filename, new VoidType(name), [IdentifierMeta.BuiltIn]);
  }

  private buildSY(): TypedIdentifier[] {
    const components: IStructureComponent[] = [];
    // NOTE: fields must be in correct sequence for the syntax check
    components.push({name: "index", type: IntegerType.get()});
    components.push({name: "pagno", type: IntegerType.get()});
    components.push({name: "tabix", type: IntegerType.get()});
    components.push({name: "tfill", type: IntegerType.get()});
    components.push({name: "tlopc", type: IntegerType.get()});
    components.push({name: "tmaxl", type: IntegerType.get()});
    components.push({name: "toccu", type: IntegerType.get()});
    components.push({name: "ttabc", type: IntegerType.get()});
    components.push({name: "tstis", type: IntegerType.get()});
    components.push({name: "ttabi", type: IntegerType.get()});
    components.push({name: "dbcnt", type: IntegerType.get()});
    components.push({name: "fdpos", type: IntegerType.get()});
    components.push({name: "colno", type: IntegerType.get()});
    components.push({name: "linct", type: IntegerType.get()});
    components.push({name: "linno", type: IntegerType.get()});
    components.push({name: "linsz", type: IntegerType.get()});
    components.push({name: "pagct", type: IntegerType.get()});
    components.push({name: "macol", type: IntegerType.get()});
    components.push({name: "marow", type: IntegerType.get()});
    components.push({name: "tleng", type: IntegerType.get()});
    components.push({name: "sfoff", type: IntegerType.get()});
    components.push({name: "willi", type: IntegerType.get()});
    components.push({name: "lilli", type: IntegerType.get()});
    components.push({name: "subrc", type: IntegerType.get()});
    components.push({name: "fleng", type: IntegerType.get()});
    components.push({name: "cucol", type: IntegerType.get()});
    components.push({name: "curow", type: IntegerType.get()});
    components.push({name: "lsind", type: IntegerType.get()});
    components.push({name: "listi", type: IntegerType.get()});
    components.push({name: "stepl", type: IntegerType.get()});
    components.push({name: "tpagi", type: IntegerType.get()});
    components.push({name: "winx1", type: IntegerType.get()});
    components.push({name: "winy1", type: IntegerType.get()});
    components.push({name: "winx2", type: IntegerType.get()});
    components.push({name: "winy2", type: IntegerType.get()});
    components.push({name: "winco", type: IntegerType.get()});
    components.push({name: "winro", type: IntegerType.get()});
    components.push({name: "windi", type: IntegerType.get()});
    components.push({name: "srows", type: IntegerType.get()});
    components.push({name: "scols", type: IntegerType.get()});
    components.push({name: "loopc", type: IntegerType.get()});
    components.push({name: "folen", type: IntegerType.get()});
    components.push({name: "fodec", type: IntegerType.get()});
    components.push({name: "tzone", type: IntegerType.get()});
    components.push({name: "dayst", type: new CharacterType(1)});
    components.push({name: "ftype", type: new CharacterType(1)});
    components.push({name: "appli", type: new HexType(2)});
    components.push({name: "fdayw", type: new AnyType()});
    components.push({name: "ccurs", type: new PackedType(5, 0)});
    components.push({name: "ccurt", type: new PackedType(5, 0)});
    components.push({name: "debug", type: new CharacterType(1)});
    components.push({name: "ctype", type: new CharacterType(1)});
    components.push({name: "input", type: new CharacterType(1, {qualifiedName: "sy-input"})});
    components.push({name: "langu", type: new CharacterType(1, {qualifiedName: "sy-langu", conversionExit: "ISOLA"})});
    components.push({name: "modno", type: IntegerType.get()});
    components.push({name: "batch", type: new CharacterType(1, {qualifiedName: "sy-batch"})});
    components.push({name: "binpt", type: new CharacterType(1, {qualifiedName: "sy-binpt"})});
    components.push({name: "calld", type: new CharacterType(1, {qualifiedName: "sy-calld"})});
    components.push({name: "dynnr", type: new CharacterType(4, {qualifiedName: "sy-dynnr"})});
    components.push({name: "dyngr", type: new CharacterType(4, {qualifiedName: "sy-dyngr"})});
    components.push({name: "newpa", type: new CharacterType(1)});
    components.push({name: "pri40", type: new CharacterType(1)});
    components.push({name: "rstrt", type: new CharacterType(1)});
    components.push({name: "wtitl", type: new CharacterType(1, {qualifiedName: "sy-wtitl"})});
    components.push({name: "cpage", type: IntegerType.get()});
    components.push({name: "dbnam", type: new CharacterType(20, {qualifiedName: "sy-dbnam"})});
    components.push({name: "mandt", type: new CharacterType(3, {qualifiedName: "sy-mandt"})});
    components.push({name: "prefx", type: new CharacterType(3)});
    components.push({name: "fmkey", type: new CharacterType(3)});
    components.push({name: "pexpi", type: new NumericType(1)});
    components.push({name: "prini", type: new NumericType(1)});
    components.push({name: "primm", type: new CharacterType(1)});
    components.push({name: "prrel", type: new CharacterType(1)});
    components.push({name: "playo", type: new CharacterType(5)});
    components.push({name: "prbig", type: new CharacterType(1)});
    components.push({name: "playp", type: new CharacterType(1)});
    components.push({name: "prnew", type: new CharacterType(1)});
    components.push({name: "prlog", type: new CharacterType(1)});
    components.push({name: "pdest", type: new CharacterType(4, {qualifiedName: "sy-pdest"})});
    components.push({name: "plist", type: new CharacterType(12)});
    components.push({name: "pauth", type: new NumericType(2)});
    components.push({name: "prdsn", type: new CharacterType(6)});
    components.push({name: "pnwpa", type: new CharacterType(1)});
    components.push({name: "callr", type: new CharacterType(8, {qualifiedName: "sy-callr"})});
    components.push({name: "repi2", type: new CharacterType(40)});
    components.push({name: "rtitl", type: new CharacterType(70)});
    components.push({name: "prrec", type: new CharacterType(12)});
    components.push({name: "prtxt", type: new CharacterType(68)});
    components.push({name: "prabt", type: new CharacterType(12)});
    components.push({name: "lpass", type: new CharacterType(4)});
    components.push({name: "nrpag", type: new CharacterType(1)});
    components.push({name: "paart", type: new CharacterType(16)});
    components.push({name: "prcop", type: new NumericType(3)});
    components.push({name: "batzs", type: new CharacterType(1)});
    components.push({name: "bspld", type: new CharacterType(1)});
    components.push({name: "brep4", type: new CharacterType(4)});
    components.push({name: "batzo", type: new CharacterType(1)});
    components.push({name: "batzd", type: new CharacterType(1)});
    components.push({name: "batzw", type: new CharacterType(1)});
    components.push({name: "batzm", type: new CharacterType(1)});
    components.push({name: "ctabl", type: new CharacterType(4)});
    components.push({name: "dbsys", type: new CharacterType(10, {qualifiedName: "sy-dbsys"})});
    components.push({name: "dcsys", type: new CharacterType(4)});
    components.push({name: "macdb", type: new CharacterType(4)});
    components.push({name: "sysid", type: new CharacterType(8, {qualifiedName: "sy-sysid"})});
    components.push({name: "opsys", type: new CharacterType(10, {qualifiedName: "sy-opsys"})});
    components.push({name: "pfkey", type: new CharacterType(20, {qualifiedName: "sy-pfkey"})});
    components.push({name: "saprl", type: new CharacterType(4, {qualifiedName: "sy-saprl"})});
    components.push({name: "tcode", type: new CharacterType(20, {qualifiedName: "sy-tcode"})});
    components.push({name: "ucomm", type: new CharacterType(70, {qualifiedName: "sy-ucomm"})});
    components.push({name: "cfwae", type: new CharacterType(5)});
    components.push({name: "chwae", type: new CharacterType(5)});
    components.push({name: "spono", type: new CharacterType(10, {qualifiedName: "sy-spono"})});
    components.push({name: "sponr", type: new NumericType(10)});
    components.push({name: "waers", type: new CharacterType(5)});
    components.push({name: "cdate", type: new DateType()});
    components.push({name: "datum", type: new DateType()});
    components.push({name: "slset", type: new CharacterType(14, {qualifiedName: "sy-slset"})});
    components.push({name: "subty", type: new HexType(1)});
    components.push({name: "subcs", type: new CharacterType(1)});
    components.push({name: "group", type: new CharacterType(1)});
    components.push({name: "ffile", type: new CharacterType(8)});
    components.push({name: "uzeit", type: new TimeType()});
    components.push({name: "dsnam", type: new CharacterType(8)});
    components.push({name: "tabid", type: new CharacterType(8)});
    components.push({name: "tfdsn", type: new CharacterType(8)});
    components.push({name: "uname", type: new CharacterType(12, {qualifiedName: "sy-uname"})});
    components.push({name: "lstat", type: new CharacterType(16)});
    components.push({name: "abcde", type: new CharacterType(26, {qualifiedName: "sy-abcde"})});
    components.push({name: "marky", type: new CharacterType(1)});
    components.push({name: "sfnam", type: new CharacterType(30)});
    components.push({name: "tname", type: new CharacterType(30)});
    components.push({name: "msgli", type: new CharacterType(60, {qualifiedName: "sy-msgli"})});
    components.push({name: "title", type: new CharacterType(70, {qualifiedName: "sy-title"})});
    components.push({name: "entry", type: new CharacterType(72)});
    components.push({name: "lisel", type: new CharacterType(255, {qualifiedName: "sy-lisel"})});
    components.push({name: "uline", type: new CharacterType(255, {qualifiedName: "sy-uline"})});
    components.push({name: "xcode", type: new CharacterType(70)});
    components.push({name: "cprog", type: new CharacterType(40, {qualifiedName: "sy-cprog"})});
    components.push({name: "xprog", type: new CharacterType(40)});
    components.push({name: "xform", type: new CharacterType(30)});
    components.push({name: "ldbpg", type: new CharacterType(40, {qualifiedName: "sy-ldbpg"})});
    components.push({name: "tvar0", type: new CharacterType(20, {qualifiedName: "sy-tvar0"})});
    components.push({name: "tvar1", type: new CharacterType(20, {qualifiedName: "sy-tvar1"})});
    components.push({name: "tvar2", type: new CharacterType(20, {qualifiedName: "sy-tvar2"})});
    components.push({name: "tvar3", type: new CharacterType(20, {qualifiedName: "sy-tvar3"})});
    components.push({name: "tvar4", type: new CharacterType(20, {qualifiedName: "sy-tvar4"})});
    components.push({name: "tvar5", type: new CharacterType(20, {qualifiedName: "sy-tvar5"})});
    components.push({name: "tvar6", type: new CharacterType(20, {qualifiedName: "sy-tvar6"})});
    components.push({name: "tvar7", type: new CharacterType(20, {qualifiedName: "sy-tvar7"})});
    components.push({name: "tvar8", type: new CharacterType(20, {qualifiedName: "sy-tvar8"})});
    components.push({name: "tvar9", type: new CharacterType(20, {qualifiedName: "sy-tvar9"})});
    components.push({name: "msgid", type: new CharacterType(20, {qualifiedName: "sy-msgid"})});
    components.push({name: "msgty", type: new CharacterType(1, {qualifiedName: "sy-msgty"})});
    components.push({name: "msgno", type: new NumericType(3, "sy-msgno")});
    components.push({name: "msgv1", type: new CharacterType(50, {qualifiedName: "sy-msgv1"})});
    components.push({name: "msgv2", type: new CharacterType(50, {qualifiedName: "sy-msgv2"})});
    components.push({name: "msgv3", type: new CharacterType(50, {qualifiedName: "sy-msgv3"})});
    components.push({name: "msgv4", type: new CharacterType(50, {qualifiedName: "sy-msgv4"})});
    components.push({name: "oncom", type: new CharacterType(1)});
    components.push({name: "vline", type: new CharacterType(1, {qualifiedName: "sy-vline"})});
    components.push({name: "winsl", type: new CharacterType(79)});
    components.push({name: "staco", type: IntegerType.get()});
    components.push({name: "staro", type: IntegerType.get()});
    components.push({name: "datar", type: new CharacterType(1, {qualifiedName: "sy-datar"})});
    components.push({name: "host", type: new CharacterType(32, {qualifiedName: "sy-host"})});
    components.push({name: "locdb", type: new CharacterType(1)});
    components.push({name: "locop", type: new CharacterType(1)});
    components.push({name: "datlo", type: new DateType()});
    components.push({name: "timlo", type: new TimeType()});
    components.push({name: "zonlo", type: new CharacterType(6, {qualifiedName: "sy-zonlo"})});

    const type = new StructureType(components);

    const id1 = new TokenIdentifier(new Position(this.row++, 1), "sy");
    const sy = new TypedIdentifier(id1, BuiltIn.filename, type, [IdentifierMeta.ReadOnly, IdentifierMeta.BuiltIn]);

    const id2 = new TokenIdentifier(new Position(this.row++, 1), "syst");
    const syst = new TypedIdentifier(id2, BuiltIn.filename, type, [IdentifierMeta.ReadOnly, IdentifierMeta.BuiltIn]);

    // https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-us/abennews-610-system.htm
    const id3 = new TokenIdentifier(new Position(this.row++, 1), "sy-repid");
    const syrepid = new TypedIdentifier(id3, BuiltIn.filename, new CharacterType(40, {qualifiedName: "sy-repid"}), [IdentifierMeta.ReadOnly, IdentifierMeta.BuiltIn]);

    return [sy, syst, syrepid];
  }

  private buildConstant(name: string, type?: AbstractType, value?: string): TypedIdentifier {
    const id = new TokenIdentifier(new Position(this.row++, 1), name);
    if (type === undefined) {
      type = new VoidType(name);
    }
    if (value === undefined) {
      value = "'?'";
    }
    return new TypedIdentifier(id, BuiltIn.filename, type, [IdentifierMeta.ReadOnly, IdentifierMeta.BuiltIn], value);
  }

}
