import {Statement} from "./statement";
import {str, seq, opt, alt, per, IRunnable} from "../combi";
import {Constant, FieldSub, FormName, MethodName, Source, FunctionParameters, FieldChain} from "../expressions";

export class CallFunction extends Statement {

  public get_matcher(): IRunnable {
    let starting = seq(str("STARTING NEW TASK"),
                       alt(new Constant(), new FieldSub()));
    let update = str("IN UPDATE TASK");
    let background = str("IN BACKGROUND TASK");
    let dest = seq(str("DESTINATION"), opt(str("IN GROUP")), new Source());
    let calling = seq(str("CALLING"), new MethodName(), str("ON END OF TASK"));
    let performing = seq(str("PERFORMING"), new FormName(), str("ON END OF TASK"));
    let separate = str("AS SEPARATE UNIT");

    let options = per(starting, update, background, dest, calling, performing, separate);

    let dynamic = seq(str("PARAMETER-TABLE"), new Source(),
                      opt(seq(str("EXCEPTION-TABLE"), new Source())));

    let call = seq(str("CALL"),
                   alt(str("FUNCTION"), str("CUSTOMER-FUNCTION")),
                   alt(new Constant(), new FieldChain()),
                   opt(options),
                   alt(new FunctionParameters(), dynamic));

    return call;
  }

}