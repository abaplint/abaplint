import {TypedIdentifier} from "../types/_typed_identifier";
import {TypedConstantIdentifier} from "../types/_typed_constant_identifier";
import {VoidType, CharacterType} from "../types/basic";
import {Identifier} from "../tokens";
import {Position} from "../../position";
import {AbstractType} from "../types/basic/_abstract_type";

export class Globals {
  private static readonly filename = "_global.prog.abap";

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
    ret.push(this.buildVariable("screen")); // todo, add structure
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
    ret.push(this.buildConstant("icon_abap"));
    ret.push(this.buildConstant("icon_abc"));
    ret.push(this.buildConstant("icon_activate"));
    ret.push(this.buildConstant("icon_address"));
    ret.push(this.buildConstant("icon_change"));
    ret.push(this.buildConstant("icon_close"));
    ret.push(this.buildConstant("icon_detail"));
    ret.push(this.buildConstant("icon_display_text"));
    ret.push(this.buildConstant("icon_display"));
    ret.push(this.buildConstant("icon_document"));
    ret.push(this.buildConstant("icon_folder"));
    ret.push(this.buildConstant("icon_folder"));
    ret.push(this.buildConstant("icon_green_light"));
    ret.push(this.buildConstant("icon_header"));
    ret.push(this.buildConstant("icon_led_green"));
    ret.push(this.buildConstant("icon_led_inactive"));
    ret.push(this.buildConstant("icon_led_red"));
    ret.push(this.buildConstant("icon_led_yellow"));
    ret.push(this.buildConstant("icon_list"));
    ret.push(this.buildConstant("icon_message_information"));
    ret.push(this.buildConstant("icon_modify"));
    ret.push(this.buildConstant("icon_okay"));
    ret.push(this.buildConstant("icon_red_light"));
    ret.push(this.buildConstant("icon_refresh"));
    ret.push(this.buildConstant("icon_replace"));
    ret.push(this.buildConstant("icon_set_state"));
    ret.push(this.buildConstant("icon_stack"));
    ret.push(this.buildConstant("icon_system_help"));
    ret.push(this.buildConstant("icon_system_save"));
    ret.push(this.buildConstant("icon_test"));
    ret.push(this.buildConstant("icon_view_maximize"));
    ret.push(this.buildConstant("icon_workflow_fork"));
    ret.push(this.buildConstant("icon_xls"));
    ret.push(this.buildConstant("icon_yellow_light"));
    ret.push(this.buildConstant("space"));

    for (const e of extras) {
      const id = new Identifier(new Position(1, 1), e);
      ret.push(new TypedConstantIdentifier(id, this.filename, new VoidType(), "'?'"));
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
    return new TypedConstantIdentifier(id, this.filename, type, value);
  }

  private static buildVariable(name: string) {
    const id = new Identifier(new Position(1, 1), name);
    return new TypedIdentifier(id, this.filename, new VoidType());
  }

}