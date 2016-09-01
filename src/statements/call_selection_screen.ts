import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class CallSelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let starting = seq(str("STARTING AT"),
                       Reuse.source(),
                       Reuse.source(),
                       str("ENDING AT"),
                       Reuse.source(),
                       Reuse.source());

    let call = seq(str("CALL SELECTION-SCREEN"), Reuse.source(), opt(starting));
    return call;
  }

}