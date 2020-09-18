import {TypedIdentifier, IdentifierMeta} from "../types/_typed_identifier";
import {VoidType, CharacterType, StructureType, IStructureComponent, IntegerType, NumericType, DateType, TimeType, StringType, FloatType, XStringType, TableType, AnyType} from "../types/basic";
import {Identifier as TokenIdentifier} from "../1_lexer/tokens";
import {Position} from "../../position";
import {AbstractType} from "../types/basic/_abstract_type";
import {IMethodDefinition} from "../types/_method_definition";
import {Visibility} from "../4_file_information/visibility";
import {Identifier} from "../4_file_information/_identifier";
import {Token} from "../1_lexer/tokens/_token";
import {IMethodParameters} from "../types/_method_parameters";
import {Version} from "../../version";

interface IBuiltinMethod {
  name: string;
  mandatory: {[key: string]: AbstractType},
  optional?: {[key: string]: AbstractType},
  version?: Version,
  return: AbstractType;
}

class BuiltInMethod extends Identifier implements IMethodDefinition, IMethodParameters {
  private readonly method: IBuiltinMethod;
  private readonly row: number;

  public constructor(token: Token, filename: string, method: IBuiltinMethod, row: number) {
    super(token, filename);
    this.method = method;
    this.row = row;
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
      ret.push(new TypedIdentifier(id, BuiltIn.filename, this.method.mandatory[i]));
    }
    return ret;
  }

  public getExporting(): readonly TypedIdentifier[] {
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
}

export class BuiltIn {
  public static readonly filename = "_builtin.prog.abap";
  private row = 1;

  private buildDefinition(method: IBuiltinMethod, row: number): IMethodDefinition {
    const token = new TokenIdentifier(new Position(row, 1), method.name);
    return new BuiltInMethod(token, BuiltIn.filename, method, row);
  }

  public searchBuiltin(name: string | undefined): IMethodDefinition | undefined {
    if (name === undefined) {
      return undefined;
    }

    const ret: IBuiltinMethod[] = [];

    ret.push({name: "ABS", mandatory: {"val": new FloatType()}, return: new IntegerType()});
    ret.push({name: "ACOS", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "ASIN", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "ATAN", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "BIT-SET", mandatory: {"val": new IntegerType()}, return: new XStringType(), version: Version.v702});
    ret.push({name: "BOOLC", mandatory: {"val": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "BOOLX", mandatory: {"bool": new StringType()}, optional: {"bit": new IntegerType()}, return: new XStringType(), version: Version.v702});
    ret.push({name: "CEIL", mandatory: {"val": new FloatType()}, return: new IntegerType()});
    ret.push({name: "CHAR_OFF", mandatory: {"val": new StringType(), "add": new IntegerType()}, optional: {"off": new IntegerType()}, return: new IntegerType(), version: Version.v702});
    ret.push({name: "CHARLEN", mandatory: {"val": new StringType()}, return: new IntegerType()});
    ret.push({name: "CMAX", mandatory: {"val1": new StringType(), "val2": new StringType()}, optional: {"val3": new StringType(), "val4": new StringType(), "val5": new StringType(), "val6": new StringType(), "val7": new StringType(), "val9": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "CMIN", mandatory: {"val1": new StringType(), "val2": new StringType()}, optional: {"val3": new StringType(), "val4": new StringType(), "val5": new StringType(), "val6": new StringType(), "val7": new StringType(), "val9": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "CONCAT_LINES_OF", mandatory: {"table": new TableType(new AnyType(), false)}, optional: {"sep": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "CONDENSE", mandatory: {"val": new StringType()}, optional: {"del": new StringType(), "from": new StringType(), "to": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "CONTAINS", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "start": new StringType(), "end": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "off": new IntegerType(), "len": new IntegerType(), "occ": new IntegerType()}, return: new CharacterType(1), version: Version.v702});
    ret.push({name: "CONTAINS_ANY_NOT_OF", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "start": new StringType(), "end": new StringType(), "off": new IntegerType(), "len": new IntegerType(), "occ": new IntegerType()}, return: new CharacterType(1), version: Version.v702});
    ret.push({name: "CONTAINS_ANY_OF", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "start": new StringType(), "end": new StringType(), "off": new IntegerType(), "len": new IntegerType(), "occ": new IntegerType()}, return: new CharacterType(1), version: Version.v702});
    ret.push({name: "COS", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "COSH", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "COUNT", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "off": new IntegerType(), "len": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "COUNT_ANY_NOT_OF", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "off": new IntegerType(), "len": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "COUNT_ANY_OF", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "off": new IntegerType(), "len": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "DBMAXLEN", mandatory: {"val": new StringType()}, return: new IntegerType()});
    ret.push({name: "DISTANCE", mandatory: {"val1": new StringType(), "val2": new StringType()}, return: new IntegerType(), version: Version.v702});
    ret.push({name: "ESCAPE", mandatory: {"val": new StringType(), "format": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "EXP", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "FIND", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "off": new IntegerType(), "len": new IntegerType(), "occ": new IntegerType()}, return: new IntegerType(), version: Version.v702});
    ret.push({name: "FIND_ANY_NOT_OF", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "off": new IntegerType(), "len": new IntegerType(), "occ": new IntegerType()}, return: new IntegerType(), version: Version.v702});
    ret.push({name: "FIND_ANY_OF", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "off": new IntegerType(), "len": new IntegerType(), "occ": new IntegerType()}, return: new IntegerType(), version: Version.v702});
    ret.push({name: "FIND_END", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "off": new IntegerType(), "len": new IntegerType(), "occ": new IntegerType()}, return: new IntegerType(), version: Version.v702});
    ret.push({name: "FLOOR", mandatory: {"val": new FloatType()}, return: new IntegerType()});
    ret.push({name: "FRAC", mandatory: {"val": new FloatType()}, return: new IntegerType()});
    ret.push({name: "FROM_MIXED", mandatory: {"val": new StringType()}, optional: {"case": new CharacterType(1), "sep": new IntegerType(), "min": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "INSERT", mandatory: {"val": new StringType(), "sub": new StringType()}, optional: {"off": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "IPOW", mandatory: {"base": new FloatType(), "exp": new FloatType()}, return: new IntegerType(), version: Version.v740sp02});
    ret.push({name: "LINE_EXISTS", mandatory: {"val": new TableType(new AnyType(), false)}, return: new CharacterType(1), version: Version.v740sp02});
    ret.push({name: "LINE_INDEX", mandatory: {"val": new StringType()}, return: new IntegerType(), version: Version.v740sp02});
    ret.push({name: "LINES", mandatory: {"val": new TableType(new AnyType(), false)}, return: new IntegerType()});
    ret.push({name: "LOG", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "LOG10", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "MATCH", mandatory: {"val": new StringType(), "regex": new StringType()}, optional: {"case": new CharacterType(1), "occ": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "MATCHES", mandatory: {"val": new StringType(), "regex": new IntegerType()}, optional: {"case": new CharacterType(1), "off": new IntegerType(), "len": new IntegerType()}, return: new CharacterType(1), version: Version.v702});
    ret.push({name: "NMAX", mandatory: {"val1": new StringType(), "val2": new StringType()}, optional: {"val3": new StringType(), "val4": new StringType(), "val5": new StringType(), "val6": new StringType(), "val7": new StringType(), "val9": new StringType()}, return: new IntegerType(), version: Version.v702});
    ret.push({name: "NMIN", mandatory: {"val1": new StringType(), "val2": new StringType()}, optional: {"val3": new StringType(), "val4": new StringType(), "val5": new StringType(), "val6": new StringType(), "val7": new StringType(), "val9": new StringType()}, return: new IntegerType(), version: Version.v702});
    ret.push({name: "NUMOFCHAR", mandatory: {"val": new StringType()}, return: new IntegerType()});
    ret.push({name: "REPEAT", mandatory: {"val": new StringType(), "occ": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "REPLACE", mandatory: {"val": new StringType(), "with": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "off": new IntegerType(), "len": new IntegerType(), "occ": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "RESCALE", mandatory: {"val": new FloatType()}, optional: {"dec": new IntegerType(), "prec": new IntegerType(), "mode": new IntegerType()}, return: new FloatType(), version: Version.v702});
    ret.push({name: "REVERSE", mandatory: {"val": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "ROUND", mandatory: {"val": new FloatType()}, optional: {"dec": new IntegerType(), "prec": new IntegerType(), "mode": new IntegerType()}, return: new IntegerType(), version: Version.v702});
    ret.push({name: "SEGMENT", mandatory: {"val": new StringType(), "index": new IntegerType()}, optional: {"sep": new StringType(), "space": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "SHIFT_LEFT", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "places": new IntegerType(), "circular": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "SHIFT_RIGHT", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "places": new IntegerType(), "circular": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "SIGN", mandatory: {"val": new FloatType()}, return: new IntegerType()});
    ret.push({name: "SIN", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "SINH", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "SQRT", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "STRLEN", mandatory: {"val": new StringType()}, return: new IntegerType()});
    ret.push({name: "SUBSTRING", mandatory: {"val": new StringType()}, optional: {"off": new IntegerType(), "len": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "SUBSTRING_AFTER", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "len": new IntegerType(), "occ": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "SUBSTRING_BEFORE", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "len": new IntegerType(), "occ": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "SUBSTRING_FROM", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "len": new IntegerType(), "occ": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "SUBSTRING_TO", mandatory: {"val": new StringType()}, optional: {"sub": new StringType(), "regex": new StringType(), "case": new CharacterType(1), "len": new IntegerType(), "occ": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "TAN", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "TANH", mandatory: {"val": new FloatType()}, return: new FloatType()});
    ret.push({name: "TO_LOWER", mandatory: {"val": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "TO_MIXED", mandatory: {"val": new StringType()}, optional: {"case": new CharacterType(1), "sep": new IntegerType(), "min": new IntegerType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "TO_UPPER", mandatory: {"val": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "TRANSLATE", mandatory: {"val": new StringType(), "from": new StringType(), "to": new StringType()}, return: new StringType(), version: Version.v702});
    ret.push({name: "TRUNC", mandatory: {"val": new FloatType()}, return: new IntegerType()});
    // todo, add UtclongType #1329
    //ret.push({name: "UTCLONG_ADD", mandatory: {"val": new UtclongType()}, optional: {"days": new IntegerType(), "hour": new IntegerType(), "minutes": new IntegerType(), "seconds": new FloatType()}, return: new UtclongType(), version: Version.v754});
    //ret.push({name: "UTCLONG_CURRENT", return: new UtclongType(), version: Version.v754});
    //ret.push({name: "UTCLONG_DIFF", mandatory: {"high": new UtclongType(), "low": new UtclongType()}, return: new FloatType(), version: Version.v754});
    ret.push({name: "XSDBOOL", mandatory: {"val": new StringType()}, return: new CharacterType(1), version: Version.v740sp08});
    ret.push({name: "XSTRLEN", mandatory: {"val": new XStringType()}, return: new IntegerType()});

    // todo, optimize, use hash map
    const index = ret.findIndex(a => a.name === name.toUpperCase());
    if (index < 0) {
      return undefined;
    }

    return this.buildDefinition(ret[index], index);
  }

  public getTypes(): TypedIdentifier[] {
    const ret: TypedIdentifier[] = this.buildSY();

    const id = new TokenIdentifier(new Position(1, 1), "abap_bool");
    ret.push(new TypedIdentifier(id, BuiltIn.filename, new CharacterType(1)));

    return ret;
  }

  public get(extras: string[]): TypedIdentifier[] {
    const ret: TypedIdentifier[] = this.buildSY();

    ret.push(this.buildVariable("screen")); // todo, add structure, or alternatively make native Statements

    ret.push(this.buildConstant("%_BACKSPACE"));
    ret.push(this.buildConstant("%_CHARSIZE"));
    ret.push(this.buildConstant("%_CR_LF"));
    ret.push(this.buildConstant("%_ENDIAN"));
    ret.push(this.buildConstant("%_FORMFEED"));
    ret.push(this.buildConstant("%_HORIZONTAL_TAB"));
    ret.push(this.buildConstant("%_MAXCHAR"));
    ret.push(this.buildConstant("%_MINCHAR"));
    ret.push(this.buildConstant("%_NEWLINE"));
    ret.push(this.buildConstant("%_VERTICAL_TAB"));

    ret.push(this.buildConstant("abap_false", new CharacterType(1), "' '"));
    ret.push(this.buildConstant("abap_true", new CharacterType(1), "'X'"));
    ret.push(this.buildConstant("abap_undefined", new CharacterType(1), "'-'"));
    ret.push(this.buildConstant("abap_off", new CharacterType(1), "' '"));
    ret.push(this.buildConstant("abap_on", new CharacterType(1), "'X'"));

    ret.push(this.buildConstant("col_background", new IntegerType(), "0"));
    ret.push(this.buildConstant("col_heading", new IntegerType(), "1"));
    ret.push(this.buildConstant("col_key", new IntegerType(), "4"));
    ret.push(this.buildConstant("col_negative", new IntegerType(), "6"));
    ret.push(this.buildConstant("col_normal", new IntegerType(), "2"));
    ret.push(this.buildConstant("col_positive", new IntegerType(), "5"));
    ret.push(this.buildConstant("col_total", new IntegerType(), "3"));

    ret.push(this.buildConstant("space", new CharacterType(1), "' '"));

    for (const e of extras) {
      const id = new TokenIdentifier(new Position(this.row++, 1), e);
      ret.push(new TypedIdentifier(id, BuiltIn.filename, new VoidType(e), [IdentifierMeta.ReadOnly, IdentifierMeta.BuiltIn], "'?'"));
    }

    return ret;
  }

/////////////////////////////

  private buildSY(): TypedIdentifier[] {
    const components: IStructureComponent[] = [];
    components.push({name: "abcde", type: new CharacterType(26)});
    components.push({name: "batch", type: new CharacterType(1)});
    components.push({name: "binpt", type: new CharacterType(1)});
    components.push({name: "calld", type: new CharacterType(1)});
    components.push({name: "callr", type: new CharacterType(8)});
    components.push({name: "colno", type: new IntegerType()});
    components.push({name: "cpage", type: new IntegerType()});
    components.push({name: "cprog", type: new CharacterType(40)});
    components.push({name: "cucol", type: new IntegerType()});
    components.push({name: "curow", type: new IntegerType()});
    components.push({name: "datar", type: new CharacterType(1)});
    components.push({name: "datlo", type: new DateType()});
    components.push({name: "datum", type: new DateType()});
    components.push({name: "dayst", type: new CharacterType(1)});
    components.push({name: "dbcnt", type: new IntegerType()});
    components.push({name: "dbnam", type: new CharacterType(20)});
    components.push({name: "dbsys", type: new CharacterType(10)});
    components.push({name: "dyngr", type: new CharacterType(4)});
    components.push({name: "dynnr", type: new CharacterType(4)});
    components.push({name: "fdayw", type: new IntegerType()});
    components.push({name: "fdpos", type: new IntegerType()});
    components.push({name: "fleng", type: new IntegerType()});
    components.push({name: "folen", type: new IntegerType()});
    components.push({name: "host", type: new CharacterType(32)});
    components.push({name: "index", type: new IntegerType()});
    components.push({name: "langu", type: new CharacterType(1)});
    components.push({name: "ldbpg", type: new CharacterType(40)});
    components.push({name: "lilli", type: new IntegerType()});
    components.push({name: "linct", type: new IntegerType()});
    components.push({name: "linno", type: new IntegerType()});
    components.push({name: "linsz", type: new IntegerType()});
    components.push({name: "lisel", type: new CharacterType(255)});
    components.push({name: "listi", type: new IntegerType()});
    components.push({name: "loopc", type: new IntegerType()});
    components.push({name: "lsind", type: new IntegerType()});
    components.push({name: "macol", type: new IntegerType()});
    components.push({name: "mandt", type: new CharacterType(3)});
    components.push({name: "marow", type: new IntegerType()});
    components.push({name: "modno", type: new IntegerType()});
    components.push({name: "msgid", type: new CharacterType(20)});
    components.push({name: "msgli", type: new CharacterType(60)});
    components.push({name: "msgno", type: new NumericType(3)});
    components.push({name: "msgty", type: new CharacterType(1)});
    components.push({name: "msgv1", type: new CharacterType(50)});
    components.push({name: "msgv2", type: new CharacterType(50)});
    components.push({name: "msgv3", type: new CharacterType(50)});
    components.push({name: "msgv4", type: new CharacterType(50)});
    components.push({name: "opsys", type: new CharacterType(10)});
    components.push({name: "pagno", type: new IntegerType()});
    components.push({name: "pfkey", type: new CharacterType(20)});
    components.push({name: "repid", type: new CharacterType(1)});
    components.push({name: "saprl", type: new CharacterType(4)});
    components.push({name: "scols", type: new IntegerType()});
    components.push({name: "slset", type: new CharacterType(14)});
    components.push({name: "spono", type: new CharacterType(10)});
    components.push({name: "srows", type: new IntegerType()});
    components.push({name: "srows", type: new IntegerType()});
    components.push({name: "staco", type: new IntegerType()});
    components.push({name: "staro", type: new IntegerType()});
    components.push({name: "stepl", type: new IntegerType()});
    components.push({name: "subrc", type: new IntegerType()});
    components.push({name: "sysid", type: new CharacterType(3)});
    components.push({name: "tabix", type: new IntegerType()});
    components.push({name: "tcode", type: new CharacterType(20)});
    components.push({name: "tfill", type: new IntegerType()});
    components.push({name: "timlo", type: new TimeType()});
    components.push({name: "title", type: new CharacterType(70)});
    components.push({name: "tleng", type: new IntegerType()});
    components.push({name: "tvar0", type: new CharacterType(20)});
    components.push({name: "tvar1", type: new CharacterType(20)});
    components.push({name: "tvar2", type: new CharacterType(20)});
    components.push({name: "tvar3", type: new CharacterType(20)});
    components.push({name: "tvar4", type: new CharacterType(20)});
    components.push({name: "tvar5", type: new CharacterType(20)});
    components.push({name: "tvar6", type: new CharacterType(20)});
    components.push({name: "tvar7", type: new CharacterType(20)});
    components.push({name: "tvar8", type: new CharacterType(20)});
    components.push({name: "tvar9", type: new CharacterType(20)});
    components.push({name: "tzone", type: new IntegerType()});
    components.push({name: "ucomm", type: new CharacterType(70)});
    components.push({name: "uline", type: new CharacterType(255)});
    components.push({name: "uname", type: new CharacterType(12)});
    components.push({name: "uzeit", type: new TimeType()});
    components.push({name: "vline", type: new CharacterType(1)});
    components.push({name: "wtitl", type: new CharacterType(1)});
    components.push({name: "zonlo", type: new CharacterType(6)});
    const type = new StructureType(components);

    const id1 = new TokenIdentifier(new Position(this.row++, 1), "sy");
    const sy = new TypedIdentifier(id1, BuiltIn.filename, type, [IdentifierMeta.ReadOnly, IdentifierMeta.BuiltIn]);

    const id2 = new TokenIdentifier(new Position(this.row++, 1), "syst");
    const syst = new TypedIdentifier(id2, BuiltIn.filename, type, [IdentifierMeta.ReadOnly, IdentifierMeta.BuiltIn]);

    return [sy, syst];
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

  private buildVariable(name: string) {
    const id = new TokenIdentifier(new Position(this.row++, 1), name);
    return new TypedIdentifier(id, BuiltIn.filename, new VoidType(name), [IdentifierMeta.BuiltIn]);
  }

}
