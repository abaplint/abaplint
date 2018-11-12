import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, IRunnable} from "../combi";
import {Constant, FieldSub, FormName, Source, FunctionParameters, FunctionName, FieldChain} from "../expressions";
import {Version} from "../../version";

export class CallFunction extends Statement {

  public getMatcher(): IRunnable {
    let starting = seq(str("STARTING NEW TASK"),
                       alt(new Constant(), new FieldSub()));
    let update = str("IN UPDATE TASK");
    let unit = seq(str("UNIT"), new Source());
    let background = seq(str("IN BACKGROUND"), alt(str("TASK"), unit));
    let dest = seq(str("DESTINATION"), opt(str("IN GROUP")), new Source());
    let calling = seq(str("CALLING"), new FieldChain(), str("ON END OF TASK"));
    let performing = seq(str("PERFORMING"), new FormName(), str("ON END OF TASK"));
    let separate = str("AS SEPARATE UNIT");

    let options = per(starting, update, background, dest, calling, performing, separate);

    let dynamic = seq(str("PARAMETER-TABLE"), new Source(),
                      opt(seq(str("EXCEPTION-TABLE"), new Source())));

    let call = seq(str("CALL"),
                   alt(str("FUNCTION"), verNot(Version.Cloud, str("CUSTOMER-FUNCTION"))),
                   new FunctionName(),
                   opt(options),
                   alt(new FunctionParameters(), dynamic));

    return call;
  }

}