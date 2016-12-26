import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Cleanup extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let into = seq(str("INTO"), new Reuse.Target());

    return seq(str("CLEANUP"), opt(into));
  }

}