import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class CallSelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let call = seq(str("CALL SELECTION-SCREEN"), Reuse.integer());
    return call;
  }

}