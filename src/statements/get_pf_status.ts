import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class GetPFStatus extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let program = seq(str("PROGRAM"), new Reuse.Source());
    let excl = seq(str("EXCLUDING"), new Reuse.Source());

    let ret = seq(str("GET PF-STATUS"),
                  new Reuse.Target(),
                  opt(program),
                  opt(excl));

    return ret;
  }

}