import {IFile} from "../../files/_ifile";
import {MemoryFile} from "../../files";

export class Globals {

  public static getFile(): IFile {
    // todo, more defintions, and move to somewhere else?
    // todo, icon_*, abap_*, col_* are from the corresponding type pools?
    return new MemoryFile("_global.prog.abap", "* Globals\n" +
      "DATA sy TYPE c.\n" + // todo, add structure
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
      "CONSTANTS space TYPE c LENGTH 1 VALUE ''.\n" +
      "CONSTANTS col_positive TYPE c LENGTH 1 VALUE '5'.\n" +
      "CONSTANTS col_negative TYPE c LENGTH 1 VALUE '6'.\n" +
      "CONSTANTS abap_undefined TYPE c LENGTH 1 VALUE '-'.\n" +
      "CONSTANTS abap_true TYPE c LENGTH 1 VALUE 'X'.\n" +
      "CONSTANTS abap_false TYPE c LENGTH 1 VALUE ''.\n");
  }

}