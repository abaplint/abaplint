import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class SetBit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET BIT"),
                  new Reuse.Source(),
                  str("OF"),
                  new Reuse.Target(),
                  opt(seq(str("TO"), new Reuse.Source())));

    return ret;
  }

}