import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Collect extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let into = seq(str("INTO"), new Reuse.Target());

    return seq(str("COLLECT"),
               new Reuse.Source(),
               opt(into));
  }

}