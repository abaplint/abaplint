import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, IStatementRunnable} from "../combi";
import {Constant, FieldSub, FormName, Source, FunctionParameters, FunctionName, Destination, MethodName} from "../expressions";
import {Version} from "../../version";

export class CallFunction extends Statement {

  public getMatcher(): IStatementRunnable {
    const method = new MethodName();

    const starting = seq(str("STARTING NEW TASK"),
                         alt(new Constant(), new FieldSub()));
    const update = str("IN UPDATE TASK");
    const unit = seq(str("UNIT"), new Source());
    const background = seq(str("IN BACKGROUND"), alt(str("TASK"), unit));
    const calling = seq(str("CALLING"), method, str("ON END OF TASK"));
    const performing = seq(str("PERFORMING"), new FormName(), str("ON END OF TASK"));
    const separate = str("AS SEPARATE UNIT");

    const options = per(starting, update, background, new Destination(), calling, performing, separate);

    const dynamic = seq(str("PARAMETER-TABLE"), new Source(),
                        opt(seq(str("EXCEPTION-TABLE"), new Source())));

    const call = seq(str("CALL"),
                     alt(str("FUNCTION"), verNot(Version.Cloud, str("CUSTOMER-FUNCTION"))),
                     new FunctionName(),
                     opt(options),
                     alt(new FunctionParameters(), dynamic));

    return call;
  }

}