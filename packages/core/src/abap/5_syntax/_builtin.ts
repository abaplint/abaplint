import {TypedIdentifier, IdentifierMeta} from "../types/_typed_identifier";
import {VoidType, CharacterType, StructureType, IStructureComponent, IntegerType, NumericType, DateType, TimeType, StringType} from "../types/basic";
import {Identifier} from "../1_lexer/tokens";
import {Position} from "../../position";
import {AbstractType} from "../types/basic/_abstract_type";

export interface IBuiltinMethod {
  name: string;
  returnType: AbstractType;
}

export class BuiltIn {
  public static readonly filename = "_builtin.prog.abap";
  private row = 1;

  public getMethods(): IBuiltinMethod[] {
    const ret: IBuiltinMethod[] = [];
    ret.push({name: "CONCAT_LINES_OF", returnType: new StringType()});
    ret.push({name: "CONDENSE", returnType: new StringType()});
    ret.push({name: "ESCAPE", returnType: new StringType()});
    ret.push({name: "FIND", returnType: new StringType()});
    ret.push({name: "LINES", returnType: new IntegerType()});
    ret.push({name: "REPEAT", returnType: new StringType()});
    ret.push({name: "REPLACE", returnType: new StringType()});
    ret.push({name: "REVERSE", returnType: new StringType()});
    ret.push({name: "STRLEN", returnType: new IntegerType()});
    ret.push({name: "SUBSTRING_AFTER", returnType: new StringType()});
    ret.push({name: "SUBSTRING_BEFORE", returnType: new StringType()});
    ret.push({name: "SUBSTRING", returnType: new StringType()});
    ret.push({name: "TO_LOWER", returnType: new StringType()});
    ret.push({name: "TO_UPPER", returnType: new StringType()});
    ret.push({name: "TRANSLATE", returnType: new StringType()});
    ret.push({name: "XSTRLEN", returnType: new IntegerType()});
    return ret;
  }

  public getTypes(): TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];

    const id = new Identifier(new Position(1, 1), "abap_bool");
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
      const id = new Identifier(new Position(this.row++, 1), e);
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
    const id = new Identifier(new Position(this.row++, 1), "sy");
    return new TypedIdentifier(id, BuiltIn.filename, type, [IdentifierMeta.ReadOnly]);
  }

  private buildConstant(name: string, type?: AbstractType, value?: string): TypedIdentifier {
    const id = new Identifier(new Position(this.row++, 1), name);
    if (type === undefined) {
      type = new VoidType(name);
    }
    if (value === undefined) {
      value = "'?'";
    }
    return new TypedIdentifier(id, BuiltIn.filename, type, [IdentifierMeta.ReadOnly], value);
  }

  private buildVariable(name: string) {
    const id = new Identifier(new Position(this.row++, 1), name);
    return new TypedIdentifier(id, BuiltIn.filename, new VoidType(name));
  }

}