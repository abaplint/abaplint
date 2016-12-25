import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Skip extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("SKIP"),
               opt(str("TO LINE")),
               opt(new Reuse.Source()));
  }

}