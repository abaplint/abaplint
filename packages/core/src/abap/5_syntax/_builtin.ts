import {TypedIdentifier, IdentifierMeta} from "../types/_typed_identifier";
import {VoidType, CharacterType} from "../types/basic";
import {Identifier} from "../1_lexer/tokens";
import {Position} from "../../position";
import {AbstractType} from "../types/basic/_abstract_type";

export class BuiltIn {
  public static readonly filename = "_builtin.prog.abap";

  public static getTypes(): TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];

    const id = new Identifier(new Position(1, 1), "abap_bool");
    ret.push(new TypedIdentifier(id, this.filename, new CharacterType(1)));

    return ret;
  }

  public static get(extras: string[]): TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];

    ret.push(this.buildVariable("sy")); // todo, add structure
    ret.push(this.buildVariable("syst")); // todo, add structure
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
      const id = new Identifier(new Position(1, 1), e);
      ret.push(new TypedIdentifier(id, this.filename, new VoidType(), [IdentifierMeta.ReadOnly], "'?'"));
    }

    return ret;
  }

  private static buildConstant(name: string, type?: AbstractType, value?: string) {
    const id = new Identifier(new Position(1, 1), name);
    if (type === undefined) {
      type = new VoidType();
    }
    if (value === undefined) {
      value = "'?'";
    }
    return new TypedIdentifier(id, this.filename, type, [IdentifierMeta.ReadOnly], value);
  }

  private static buildVariable(name: string) {
    const id = new Identifier(new Position(1, 1), name);
    return new TypedIdentifier(id, this.filename, new VoidType());
  }

}