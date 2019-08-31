import {MemoryFile} from "../../files";
import {Registry} from "../../registry";
import {Procedural} from "./_procedural";
import {Identifier} from "../types/_identifier";
import {IFile} from "../../files/_ifile";
import {Variables} from "./_variables";

export class Globals {
  private static cache: Identifier[];
  private static extras: number;

  public static get(extras: string[]): Identifier[] {
    // todo, more defintions, and move to somewhere else?

    if (this.cache && this.extras === extras.length) {
// todo, this is a workaround for not having to parse the below for every file
      return this.cache;
    }

    let code = "* Globals\n" +
      "DATA sy TYPE c.\n" + // todo, add structure
      "DATA syst TYPE c.\n" + // todo, add structure
      "DATA screen TYPE c.\n" + // todo, add structure
      "DATA text TYPE c.\n" + // todo, this is not correct, add structure
      "CONSTANTS %_CHARSIZE TYPE i.\n" +
      "CONSTANTS %_ENDIAN TYPE c LENGTH 1.\n" +
      "CONSTANTS %_MINCHAR TYPE c LENGTH 1.\n" +
      "CONSTANTS %_MAXCHAR TYPE c LENGTH 1.\n" +
      "CONSTANTS %_HORIZONTAL_TAB TYPE c LENGTH 1.\n" +
      "CONSTANTS %_VERTICAL_TAB TYPE c LENGTH 1.\n" +
      "CONSTANTS %_NEWLINE TYPE c LENGTH 1.\n" +
      "CONSTANTS %_CR_LF TYPE c LENGTH 2.\n" +
      "CONSTANTS %_FORMFEED TYPE c LENGTH 1.\n" +
      "CONSTANTS %_BACKSPACE TYPE c LENGTH 1.\n" +
      "CONSTANTS icon_led_red TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_led_yellow TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_led_green TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_led_inactive TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_green_light TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_yellow_light TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_red_light TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_workflow_fork TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_folder TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_okay TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_folder TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_header TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_detail TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_modify TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_replace TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_refresh TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_xls TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_message_information TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_system_help TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_stack TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_abap TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS space TYPE c LENGTH 1 VALUE ''.\n" +
      "CONSTANTS col_total TYPE c LENGTH 1 VALUE '?'.\n" +
      "CONSTANTS col_key TYPE c LENGTH 1 VALUE '?'.\n" +
      "CONSTANTS col_positive TYPE c LENGTH 1 VALUE '?'.\n" +
      "CONSTANTS col_negative TYPE c LENGTH 1 VALUE '?'.\n" +
      "CONSTANTS col_heading TYPE c LENGTH 1 VALUE '?'.\n" +
      "CONSTANTS col_background TYPE c LENGTH 1 VALUE '?'.\n" +
      "CONSTANTS abap_undefined TYPE c LENGTH 1 VALUE '-'.\n" +
      "CONSTANTS abap_true TYPE c LENGTH 1 VALUE 'X'.\n" +
      "CONSTANTS abap_false TYPE c LENGTH 1 VALUE ' '.\n";

    for (const e of extras) {
      code = code + "CONSTANTS " + e + " TYPE c LENGTH 1 VALUE '?'.\n";
    }

    const file = new MemoryFile("_global.prog.abap", code);

    this.cache = this.typesInFile(file);
    this.extras = extras.length;

    return this.cache;
  }

  private static typesInFile(file: IFile): Identifier[] {
    const reg = new Registry();
    const variables = new Variables();
    const structure = reg.addFile(file).getABAPFiles()[0].getStructure();
    if (structure === undefined) {
      throw new Error("globals, parser error");
    }

    const proc = new Procedural(reg.getABAPObjects()[0], reg, variables);
    for (const statement of structure.findAllStatementNodes()) {
      proc.findDefinitions(statement);
    }
    return variables.getCurrentScope();
  }

}