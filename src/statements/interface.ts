import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Interface extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let options = alt(str("PUBLIC"), str("LOAD"), str("DEFERRED"));

    return seq(str("INTERFACE"),
               new Reuse.Field(),
               opt(options));
  }

  public indentationEnd(_prev) {
    return 2;
  }

}