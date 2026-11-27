import {IStatement} from "./_statement";
import {verNotLang, seq, alt, opt, per} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Communication implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seq("LENGTH", Source);

    const returncode = seq("RETURNCODE", Target);
    const buffer = seq("BUFFER", Source);
    const init = seq("INIT ID", Target, "DESTINATION", Source);
    const allocate = seq("ALLOCATE ID", Source, opt(returncode));
    const send = seq("SEND ID", Source, opt(per(buffer, length)), opt(returncode));
    const deallocate = seq("DEALLOCATE ID", Source, opt(returncode));
    const accept = seq("ACCEPT ID", Target);

    const receive = seq("RECEIVE ID",
                        Source,
                        "BUFFER",
                        Target,
                        opt(length),
                        "DATAINFO",
                        Target,
                        "STATUSINFO",
                        Target,
                        "RECEIVED",
                        Target);

    const ret = seq("COMMUNICATION",
                    alt(init, allocate, send, deallocate, receive, accept));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
