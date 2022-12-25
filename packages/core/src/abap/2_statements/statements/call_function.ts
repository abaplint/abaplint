import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, per, altPrio} from "../combi";
import {FormName, Source, FunctionParameters, FunctionName, Destination, MethodName, SimpleSource2} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallFunction implements IStatement {

  public getMatcher(): IStatementRunnable {

    const starting = seq("STARTING NEW TASK", SimpleSource2);
    const update = str("IN UPDATE TASK");
    const unit = seq("UNIT", Source);
    const background = verNot(Version.Cloud, seq("IN BACKGROUND", altPrio("TASK", unit)));
    const calling = seq("CALLING", MethodName, "ON END OF TASK");
    const performing = seq("PERFORMING", FormName, "ON END OF TASK");
    const separate = str("AS SEPARATE UNIT");
    const keeping = str("KEEPING LOGICAL UNIT OF WORK");

    const options = per(starting, update, background, Destination, calling, performing, separate, keeping);

    const dynamic = seq("PARAMETER-TABLE", Source,
                        opt(seq("EXCEPTION-TABLE", Source)));

    const call = seq("CALL",
                     altPrio("FUNCTION", verNot(Version.Cloud, "CUSTOMER-FUNCTION")),
                     FunctionName,
                     opt(options),
                     alt(FunctionParameters, dynamic));

    return call;
  }

}