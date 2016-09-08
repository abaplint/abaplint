import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Report extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("REPORT"),
               opt(new Reuse.Field()),
               opt(seq(str("LINE-SIZE"), new Reuse.Integer())),
               opt(str("NO STANDARD PAGE HEADING")),
               opt(seq(str("LINE-SIZE"), new Reuse.Integer())),
               opt(seq(str("LINE-COUNT"), new Reuse.Integer())),
               opt(seq(str("MESSAGE-ID"), new Reuse.Field())));
  }

}