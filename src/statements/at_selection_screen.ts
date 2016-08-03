import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class AtSelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let output = str("OUTPUT");
    let value = seq(str("ON VALUE-REQUEST FOR"), Reuse.field());
    let exit = str("ON EXIT-COMMAND");
    let ret = seq(str("AT SELECTION-SCREEN"), alt(output, value, exit));

    return ret;
  }

}