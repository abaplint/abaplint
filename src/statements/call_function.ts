import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class CallFunction extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let starting = seq(str("STARTING NEW TASK"), Reuse.constant());

    let call = seq(str("CALL FUNCTION"),
                   alt(Reuse.constant(), Reuse.field()),
                   opt(starting),
                   opt(str("IN UPDATE TASK")),
                   Reuse.function_parameters());

    return call;
  }

}