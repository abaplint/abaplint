import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let per = Combi.per;

export class Report extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let heading = str("NO STANDARD PAGE HEADING");
    let size = seq(str("LINE-SIZE"), new Reuse.Integer());
    let count = seq(str("LINE-COUNT"), new Reuse.Integer());
    let message = seq(str("MESSAGE-ID"), new Reuse.MessageClass());

    return seq(str("REPORT"),
               opt(new Reuse.NamespaceSimpleName()),
               opt(per(heading, size, count, message)));
  }

}