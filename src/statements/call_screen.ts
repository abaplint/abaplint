import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class CallScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let call = seq(str("CALL SCREEN"), Reuse.integer());
    return call;
  }

}