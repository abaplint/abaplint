import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Open extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let direction = alt(str("FOR OUTPUT"), str("FOR INPUT"));
    let mode = alt(str("IN BINARY MODE"), str("IN TEXT MODE"));
    let encoding = str("ENCODING DEFAULT");

    let ret = seq(str("OPEN DATASET"), Reuse.field(), direction, opt(mode), opt(encoding));
    return ret;
  }

}