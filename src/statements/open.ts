import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Open extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let mode = alt(str("FOR OUTPUT"), str("FOR INPUT"));
    let ret = seq(str("OPEN DATASET"), Reuse.field(), mode, opt(str("IN BINARY MODE")));
    return ret;
  }

}