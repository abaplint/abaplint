import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class CallSelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let starting = seq(str("STARTING AT"),
                       new Reuse.Source(),
                       new Reuse.Source(),
                       str("ENDING AT"),
                       new Reuse.Source(),
                       new Reuse.Source());

    let call = seq(str("CALL SELECTION-SCREEN"), new Reuse.Source(), opt(starting));
    return call;
  }

}