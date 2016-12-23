import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class AtSelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let output = str("OUTPUT");

    let value = seq(str("ON VALUE-REQUEST FOR"), new Reuse.FieldSub());

    let exit = str("ON EXIT-COMMAND");

    let field = seq(str("ON"), new Reuse.Field());

    let radio = seq(str("ON RADIOBUTTON GROUP"), new Reuse.Field());

    let ret = seq(str("AT SELECTION-SCREEN"),
                  opt(alt(output, value, radio, exit, field)));

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