import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, alts, pers} from "../combi";
import {FormName, Source, FunctionParameters, FunctionName, Destination, MethodName, BasicSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallFunction implements IStatement {

  public getMatcher(): IStatementRunnable {
    const method = new MethodName();

    const starting = seqs("STARTING NEW TASK", BasicSource);
    const update = str("IN UPDATE TASK");
    const unit = seqs("UNIT", Source);
    const background = seqs("IN BACKGROUND", alts("TASK", unit));
    const calling = seqs("CALLING", method, "ON END OF TASK");
    const performing = seqs("PERFORMING", FormName, "ON END OF TASK");
    const separate = str("AS SEPARATE UNIT");
    const keeping = str("KEEPING LOGICAL UNIT OF WORK");

    const options = pers(starting, update, background, Destination, calling, performing, separate, keeping);

    const dynamic = seqs("PARAMETER-TABLE", Source,
                         opts(seqs("EXCEPTION-TABLE", Source)));

    const call = seqs("CALL",
                      alts("FUNCTION", verNot(Version.Cloud, str("CUSTOMER-FUNCTION"))),
                      FunctionName,
                      opts(options),
                      alts(FunctionParameters, dynamic));

    return call;
  }

}