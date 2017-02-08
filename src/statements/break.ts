import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Break extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let id = seq(str("ID"), new Reuse.Field());
    let next = str("AT NEXT APPLICATION STATEMENT");
    let log = new Reuse.Source();

    return alt(seq(str("BREAK-POINT"), opt(alt(id, next, log))),
               seq(str("BREAK"), new Reuse.Field()));
  }

}