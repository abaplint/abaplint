import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class DeleteReport extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let state = seq(str("STATE"), new Reuse.Source());

    return seq(str("DELETE REPORT"),
               new Reuse.Source(),
               opt(state));
  }

}