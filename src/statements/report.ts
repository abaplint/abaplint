import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Report extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("REPORT"),
               opt(Reuse.field()),
               opt(seq(str("LINE-SIZE"), Reuse.integer())),
               opt(seq(str("MESSAGE-ID"), Reuse.field())));
  }

}