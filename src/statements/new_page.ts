import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let per = Combi.per;
let opt = Combi.opt;

export class NewPage extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let line = seq(str("LINE-SIZE"), new Reuse.Source());
    let print = seq(str("PRINT"), alt(str("OFF"), str("ON")));
    let parameters = seq(str("PARAMETERS"), new Reuse.Source());
    let archive = seq(str("ARCHIVE PARAMETERS"), new Reuse.Source());
    let lineCount = seq(str("LINE-COUNT"), new Reuse.Source());

    return seq(str("NEW-PAGE"),
               opt(per(print,
                       alt(str("NO-TITLE"), str("WITH-TITLE")),
                       alt(str("NO-HEADING"), str("WITH-HEADING")),
                       str("NO DIALOG"),
                       parameters,
                       archive,
                       str("NEW-SECTION"),
                       lineCount,
                       line)));
  }

}