import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class CallScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let starting = seq(str("STARTING AT"), Reuse.source(), Reuse.source());

    let call = seq(str("CALL SCREEN"), Reuse.integer(), opt(starting));

    return call;
  }

}