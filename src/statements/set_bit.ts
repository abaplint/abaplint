import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class SetBit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET BIT"),
                  Reuse.source(),
                  str("OF"),
                  Reuse.target(),
                  opt(seq(str("TO"), Reuse.source())));

    return ret;
  }

}