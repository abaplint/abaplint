import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class FunctionPool extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("FUNCTION-POOL"),
               new Reuse.Field(),
               opt(seq(str("MESSAGE-ID"), new Reuse.Source())));
  }

}