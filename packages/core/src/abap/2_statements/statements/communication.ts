import {IStatement} from "./_statement";
import {verNot, seq, alt, opt, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Communication implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seq("LENGTH", Target);

    const returncode = seq("RETURNCODE", Source);
    const buffer = seq("BUFFER", Target);
    const init = seq("INIT ID", Source, "DESTINATION", Target);
    const allocate = seq("ALLOCATE ID", Source, opt(returncode));
    const send = seq("SEND ID", Source, opt(per(buffer, length)), opt(returncode));
    const deallocate = seq("DEALLOCATE ID", Source, opt(returncode));
    const accept = seq("ACCEPT ID", Source);

    const receive = seq("RECEIVE ID",
                        Source,
                        "BUFFER",
                        Source,
                        opt(length),
                        "DATAINFO",
                        Target,
                        "STATUSINFO",
                        Target,
                        "RECEIVED",
                        Target);

    const ret = seq("COMMUNICATION",
                    alt(init, allocate, send, deallocate, receive, accept));

    return verNot(Version.Cloud, ret);
  }

}