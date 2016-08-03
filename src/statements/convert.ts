import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Convert extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let ret = seq(str("CONVERT TIME STAMP"),
                  Reuse.source(),
                  str("TIME ZONE"),
                  Reuse.source(),
                  str("INTO DATE"),
                  Reuse.target(),
                  str("TIME"),
                  Reuse.target(),
                  opt(seq(str("DAYLIGHT SAVING TIME"), Reuse.target())));

    return ret;
  }

}