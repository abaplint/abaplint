import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class GetTime extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let options = seq(alt(str("STAMP FIELD"), str("FIELD")), new Reuse.Target());
    return seq(str("GET TIME"), opt(options));
  }

}