import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class CallFunction extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let starting = seq(str("STARTING NEW TASK"),
                       alt(new Reuse.Constant(), new Reuse.FieldSub()));
    let update = str("IN UPDATE TASK");
    let background = str("IN BACKGROUND TASK");
    let dest = seq(str("DESTINATION"), opt(str("IN GROUP")), new Reuse.Source());
    let calling = seq(str("CALLING"), new Reuse.FormName(), str("ON END OF TASK"));
    let performing = seq(str("PERFORMING"), new Reuse.FormName(), str("ON END OF TASK"));
    let separate = str("AS SEPARATE UNIT");

    let options = per(starting, update, background, dest, calling, performing, separate);

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