import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let per = Combi.per;

export class NewPage extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let line = seq(str("LINE-SIZE"), new Reuse.Source());

    let print = seq(str("PRINT"), alt(str("OFF"), str("ON")));

    return seq(str("NEW-PAGE"),
               per(print,
                   alt(str("NO-TITLE"), str("WITH-TITLE")),
                   str("NO-HEADING"),
                   line));
  }

}