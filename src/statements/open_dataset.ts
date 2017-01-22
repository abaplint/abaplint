import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class Open extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let mode = alt(str("IN BINARY MODE"),
                   str("IN TEXT MODE"),
                   str("IN LEGACY TEXT MODE"),
                   str("IN LEGACY BINARY MODE"));

    let direction = alt(str("FOR OUTPUT"), str("FOR INPUT"));
    let encoding = seq(str("ENCODING"), new Reuse.Source());
    let pos = seq(str("AT POSITION"), new Reuse.Source());
    let message = seq(str("MESSAGE"), new Reuse.Target());
    let ignoring = str("IGNORING CONVERSION ERRORS");

    let ret = seq(str("OPEN DATASET"),
                  new Reuse.Field(),
                  direction,
                  opt(mode),
                  opt(per(encoding, pos, message, ignoring)));

    return ret;
  }

}