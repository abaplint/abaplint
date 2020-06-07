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
  row: number;
  name: string;
  importing: {name: string, type: AbstractType}[],
  returnType: AbstractType;
}

class BuiltInMethod extends Identifier implements IMethodDefinition, IMethodParameters {
  private readonly method: IBuiltinMethod;

  public constructor(token: Token, filename: string, method: IBuiltinMethod) {
    super(token, filename);
    this.method = method;
  }

  public getAll(): readonly TypedIdentifier[] {
    throw new Error("BuiltInMethod->getAll, Method not implemented.");
  }
  public getImporting(): readonly TypedIdentifier[] {
    throw new Error("BuiltInMethod->getImporting, Method not implemented.");
  }
  public getExporting(): readonly TypedIdentifier[] {
    return [];
  }
  public getChanging(): readonly TypedIdentifier[] {
    return [];
  }
  public getReturning(): TypedIdentifier | undefined {
    const id = new TokenIdentifier(new Position(this.method.row, 1), "ret");
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

  private buildDefinition(method: IBuiltinMethod): IMethodDefinition {
    const token = new TokenIdentifier(new Position(method.row, 1), method.name);
    return new BuiltInMethod(token, BuiltIn.filename, method);
  }

  public searchBuiltin(name: string | undefined): IMethodDefinition | undefined {
    if (name === undefined) {
      return undefined;
    }

    const ret: IBuiltinMethod[] = [];

    ret.push({row: 1, name: "CONCAT_LINES_OF", importing: [], returnType: new StringType()});
    ret.push({row: 2, name: "CONDENSE", importing: [], returnType: new StringType()});
    ret.push({row: 3, name: "ESCAPE", importing: [], returnType: new StringType()});
    ret.push({row: 4, name: "FIND", importing: [], returnType: new StringType()});
    ret.push({row: 5, name: "LINES", importing: [], returnType: new IntegerType()});
    ret.push({row: 6, name: "REPEAT", importing: [], returnType: new StringType()});
    ret.push({row: 7, name: "REPLACE", importing: [], returnType: new StringType()});
    ret.push({row: 8, name: "REVERSE", importing: [], returnType: new StringType()});
    ret.push({row: 9, name: "STRLEN", importing: [], returnType: new IntegerType()});
    ret.push({row: 10, name: "SUBSTRING_AFTER", importing: [], returnType: new StringType()});
    ret.push({row: 11, name: "SUBSTRING_BEFORE", importing: [], returnType: new StringType()});
    ret.push({row: 12, name: "SUBSTRING", importing: [], returnType: new StringType()});
    ret.push({row: 13, name: "TO_LOWER", importing: [], returnType: new StringType()});
    ret.push({row: 14, name: "TO_UPPER", importing: [], returnType: new StringType()});
    ret.push({row: 15, name: "TRANSLATE", importing: [], returnType: new StringType()});
    ret.push({row: 16, name: "XSTRLEN", importing: [], returnType: new IntegerType()});

    const found = ret.find(a => a.name === name.toUpperCase());
    if (found === undefined) {
      return undefined;
    }

    return this.buildDefinition(found);
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