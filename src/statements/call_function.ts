import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class CallFunction extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let starting = seq(str("STARTING NEW TASK"), new Reuse.Constant());
    let update = str("IN UPDATE TASK");
    let background = str("IN BACKGROUND TASK");
    let dest = seq(str("DESTINATION"), new Reuse.Source());

    let options = alt(starting, update, per(background, dest));

    let dynamic = seq(str("PARAMETER-TABLE"), new Reuse.Source(),
                      opt(seq(str("EXCEPTION-TABLE"), new Reuse.Source())));

    let call = seq(str("CALL"),
                   alt(str("FUNCTION"), str("CUSTOMER-FUNCTION")),
                   alt(new Reuse.Constant(), new Reuse.FieldChain()),
                   opt(options),
                   alt(new Reuse.FunctionParameters(), dynamic));

    return call;
  }

}