import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Transfer extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let length = seq(str("LENGTH"), Reuse.source());
    let ret = seq(str("TRANSFER"), Reuse.source(), str("TO"), Reuse.target(), opt(length));
    return ret;
  }

}