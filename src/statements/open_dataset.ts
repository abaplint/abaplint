import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let per = Combi.per;
let opt = Combi.opt;

export class Open extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let mode = seq(str("IN"),
                   opt(str("LEGACY")),
                   alt(str("BINARY MODE"),
                       str("TEXT MODE")));

    let direction = seq(str("FOR"), alt(str("OUTPUT"), str("INPUT"), str("APPENDING")));
    let encoding = seq(str("ENCODING"), new Reuse.Source());
    let pos = seq(str("AT POSITION"), new Reuse.Source());
    let message = seq(str("MESSAGE"), new Reuse.Target());
    let ignoring = str("IGNORING CONVERSION ERRORS");
    let bom = str("SKIPPING BYTE-ORDER MARK");

    let ret = seq(str("OPEN DATASET"),
                  new Reuse.Target(),
                  per(direction, mode, encoding, pos, message, ignoring, bom));

    return ret;
  }

}