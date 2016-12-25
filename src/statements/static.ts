import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Static extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  new Reuse.Field(),
                  alt(new Reuse.Type(), new Reuse.TypeTable()));

    return ret;
  }

}