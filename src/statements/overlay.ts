import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class Overlay extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("OVERLAY"), Reuse.target(), str("WITH"), Reuse.source());

    return ret;
  }

}