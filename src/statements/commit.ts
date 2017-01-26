import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Commit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let work = seq(str("WORK"), opt(str("AND WAIT")));

    let connection = seq(str("CONNECTION"), alt(new Reuse.Source(), new Reuse.Dynamic()));

    return seq(str("COMMIT"), alt(work, connection));
  }

}