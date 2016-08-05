import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class SetPFStatus extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET PF-STATUS"), Reuse.source(), opt(seq(str("EXCLUDING"), Reuse.source())));

    return ret;
  }

}