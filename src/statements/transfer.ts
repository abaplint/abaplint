import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Transfer extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let length = seq(str("LENGTH"),
                     new Reuse.Source());

    let ret = seq(str("TRANSFER"),
                  new Reuse.Source(),
                  str("TO"),
                  new Reuse.Target(),
                  opt(length));

    return ret;
  }

}