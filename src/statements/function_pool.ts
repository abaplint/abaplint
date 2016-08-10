import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class FunctionPool extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("FUNCTION-POOL"),
               Reuse.field(),
               opt(seq(str("MESSAGE-ID"), Reuse.source())));
  }

}