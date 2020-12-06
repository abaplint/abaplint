import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, pers} from "../combi";
import {FormName, Source, FunctionParameters, FunctionName, Destination, MethodName, BasicSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallFunction implements IStatement {

  public getMatcher(): IStatementRunnable {

    const starting = seq("STARTING NEW TASK", BasicSource);
    const update = str("IN UPDATE TASK");
    const unit = seq("UNIT", Source);
    const background = seq("IN BACKGROUND", alt("TASK", unit));
    const calling = seq("CALLING", MethodName, "ON END OF TASK");
    const performing = seq("PERFORMING", FormName, "ON END OF TASK");
    const separate = str("AS SEPARATE UNIT");
    const keeping = str("KEEPING LOGICAL UNIT OF WORK");

    const options = pers(starting, update, background, Destination, calling, performing, separate, keeping);

    const dynamic = seq("PARAMETER-TABLE", Source,
                        opt(seq("EXCEPTION-TABLE", Source)));

    const call = seq("CALL",
                     alt("FUNCTION", verNot(Version.Cloud, "CUSTOMER-FUNCTION")),
                     FunctionName,
                     opt(options),
                     alt(FunctionParameters, dynamic));

    return call;
  }

}