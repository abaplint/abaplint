import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Rollback extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let connection = seq(str("CONNECTION"),
                         alt(new Reuse.Dynamic(), new Reuse.Field()));

    return seq(str("ROLLBACK"), alt(str("WORK"), connection));
  }

}