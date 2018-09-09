import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, regex as reg, IRunnable} from "../combi";

export class AtSelectionScreen extends Statement {

  public static get_matcher(): IRunnable {
    let output = str("OUTPUT");

    let value = seq(str("ON VALUE-REQUEST FOR"), new Reuse.FieldSub());

    let exit = str("ON EXIT-COMMAND");

    let field = seq(str("ON"), new Reuse.FieldSub());

    let end = seq(str("ON END OF"), new Reuse.Field());

    let radio = seq(str("ON RADIOBUTTON GROUP"), new Reuse.Field());

    let block = seq(str("ON BLOCK"), reg(/^\w+$/));

    let help = seq(str("ON HELP-REQUEST FOR"), new Reuse.FieldSub());

    let ret = seq(str("AT SELECTION-SCREEN"),
                  opt(alt(output, value, radio, exit, field, end, help, block)));

    return ret;
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s === undefined;
  }

  public indentationSetStart() {
    return 0;
  }

  public indentationSetEnd() {
    return 2;
  }

}