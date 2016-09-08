import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class CallFunction extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let starting = seq(str("STARTING NEW TASK"), new Reuse.Constant());
    let update = str("IN UPDATE TASK");
    let background = str("IN BACKGROUND TASK");
    let dest = seq(str("DESTINATION"), new Reuse.Source());

    let options = alt(starting, update, background, dest);

    let call = seq(str("CALL FUNCTION"),
                   alt(new Reuse.Constant(), new Reuse.FieldChain()),
                   opt(options),
                   new Reuse.FunctionParameters());

    return call;
  }

}