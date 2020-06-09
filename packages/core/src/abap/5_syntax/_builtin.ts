import {TypedIdentifier, IdentifierMeta} from "../types/_typed_identifier";
import {VoidType, CharacterType, StructureType, IStructureComponent, IntegerType, NumericType, DateType, TimeType, StringType} from "../types/basic";
import {Identifier as TokenIdentifier} from "../1_lexer/tokens";
import {Position} from "../../position";
import {AbstractType} from "../types/basic/_abstract_type";
import {IMethodDefinition} from "../types/_method_definition";
import {Visibility} from "../4_file_information/visibility";
import {Identifier} from "../4_file_information/_identifier";
import {Token} from "../1_lexer/tokens/_token";
import {IMethodParameters} from "../types/_method_parameters";

interface IBuiltinMethod {
  name: string;
  importing: {name: string, type: AbstractType}[],
  returnType: AbstractType;
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
    for (const i of this.method.importing) {
      const id = new TokenIdentifier(new Position(this.row, 1), i.name);
      ret.push(new TypedIdentifier(id, BuiltIn.filename, i.type));
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
    return new TypedIdentifier(id, BuiltIn.filename, this.method.returnType);
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

    // todo, some of these are version specific
    // todo, make types correct, some of the string sare clike?
    ret.push({name: "BOOLC", importing: [{name: "val", type: new StringType()}], returnType: new CharacterType(1)});
    ret.push({name: "CONCAT_LINES_OF", importing: [{name: "table", type: new StringType()}, {name: "sep", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "CONDENSE", importing: [{name: "val", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "CONTAINS", importing: [{name: "val", type: new StringType()}, {name: "sub", type: new StringType()}], returnType: new CharacterType(1)});
    ret.push({name: "ESCAPE", importing: [{name: "val", type: new StringType()}, {name: "format", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "FIND", importing: [{name: "val", type: new StringType()}, {name: "sub", type: new StringType()}, {name: "regex", type: new StringType()}, {name: "case", type: new CharacterType(1)}], returnType: new StringType()});
    ret.push({name: "LINES", importing: [{name: "val", type: new StringType()}], returnType: new IntegerType()});
    ret.push({name: "REPEAT", importing: [{name: "val", type: new StringType()}, {name: "occ", type: new IntegerType()}, {name: "regex", type: new IntegerType()}], returnType: new StringType()});
    ret.push({name: "REPLACE", importing: [{name: "val", type: new StringType()}, {name: "occ", type: new IntegerType()}, {name: "sub", type: new StringType()}, {name: "regex", type: new StringType()}, {name: "with", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "REVERSE", importing: [{name: "val", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "SHIFT_LEFT", importing: [{name: "val", type: new StringType()}, {name: "sub", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "SHIFT_RIGHT", importing: [{name: "val", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "STRLEN", importing: [{name: "val", type: new StringType()}], returnType: new IntegerType()});
    ret.push({name: "SUBSTRING_AFTER", importing: [{name: "val", type: new StringType()}, {name: "sub", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "SUBSTRING_BEFORE", importing: [{name: "val", type: new StringType()}, {name: "sub", type: new StringType()}, {name: "regex", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "SUBSTRING", importing: [{name: "val", type: new StringType()}, {name: "len", type: new IntegerType()}, {name: "off", type: new IntegerType()}], returnType: new StringType()});
    ret.push({name: "TO_LOWER", importing: [{name: "val", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "TO_UPPER", importing: [{name: "val", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "TRANSLATE", importing: [{name: "val", type: new StringType()}, {name: "from", type: new StringType()}, {name: "to", type: new StringType()}], returnType: new StringType()});
    ret.push({name: "XSDBOOL", importing: [{name: "val", type: new StringType()}], returnType: new CharacterType(1)});
    ret.push({name: "XSTRLEN", importing: [{name: "val", type: new StringType()}], returnType: new IntegerType()});

    const index = ret.findIndex(a => a.name === name.toUpperCase());
    if (index < 0) {
      return undefined;
    }

    return this.buildDefinition(ret[index], index);
  }

  public getTypes(): TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];

    const id = new TokenIdentifier(new Position(1, 1), "abap_bool");
    ret.push(new TypedIdentifier(id, BuiltIn.filename, new CharacterType(1)));

    ret.push(this.buildSY());

    return ret;
  }

  public get(extras: string[]): TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];

    ret.push(this.buildSY());
    ret.push(this.buildVariable("screen")); // todo, add structure, or alternatively make native Statements
    ret.push(this.buildVariable("text")); // todo, this should be parsed to text elements? and this var removed

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

    ret.push(this.buildConstant("col_background"));
    ret.push(this.buildConstant("col_heading"));
    ret.push(this.buildConstant("col_key"));
    ret.push(this.buildConstant("col_negative"));
    ret.push(this.buildConstant("col_normal"));
    ret.push(this.buildConstant("col_positive"));
    ret.push(this.buildConstant("col_total"));

    ret.push(this.buildConstant("space"));

    for (const e of extras) {
      const id = new TokenIdentifier(new Position(this.row++, 1), e);
      ret.push(new TypedIdentifier(id, BuiltIn.filename, new VoidType(e), [IdentifierMeta.ReadOnly], "'?'"));
    }

    return ret;
  }

/////////////////////////////

  private buildSY(): TypedIdentifier {
    const components: IStructureComponent[] = [];
    components.push({name: "subrc", type: new IntegerType()});
    components.push({name: "uname", type: new CharacterType(12)});
    components.push({name: "batch", type: new CharacterType(1)});
    components.push({name: "ucomm", type: new CharacterType(70)});
    components.push({name: "pfkey", type: new CharacterType(20)});
    components.push({name: "cprog", type: new CharacterType(40)});
    components.push({name: "dynnr", type: new CharacterType(4)});
    components.push({name: "langu", type: new CharacterType(1)});
    components.push({name: "tabix", type: new IntegerType()});
    components.push({name: "datum", type: new DateType()});
    components.push({name: "uzeit", type: new TimeType()});
    components.push({name: "index", type: new IntegerType()});
    components.push({name: "msgid", type: new CharacterType(20)});
    components.push({name: "msgno", type: new NumericType(3)});
    components.push({name: "msgv1", type: new CharacterType(50)});
    components.push({name: "msgv2", type: new CharacterType(50)});
    components.push({name: "msgv3", type: new CharacterType(50)});
    components.push({name: "msgv4", type: new CharacterType(50)});
    components.push({name: "repid", type: new CharacterType(1)});
    const type = new StructureType(components);
    const id = new TokenIdentifier(new Position(this.row++, 1), "sy");
    return new TypedIdentifier(id, BuiltIn.filename, type, [IdentifierMeta.ReadOnly]);
  }

  private buildConstant(name: string, type?: AbstractType, value?: string): TypedIdentifier {
    const id = new TokenIdentifier(new Position(this.row++, 1), name);
    if (type === undefined) {
      type = new VoidType(name);
    }
    if (value === undefined) {
      value = "'?'";
    }
    return new TypedIdentifier(id, BuiltIn.filename, type, [IdentifierMeta.ReadOnly], value);
  }

  private buildVariable(name: string) {
    const id = new TokenIdentifier(new Position(this.row++, 1), name);
    return new TypedIdentifier(id, BuiltIn.filename, new VoidType(name));
  }

}