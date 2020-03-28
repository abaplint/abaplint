import {IStatement} from "./_statement";
import {verNot, str, seq, alt, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Communication implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seq(str("LENGTH"), new Target());

    const init = seq(str("INIT ID"), new Source(), str("DESTINATION"), new Target());
    const allocate = seq(str("ALLOCATE ID"), new Source());
    const send = seq(str("SEND ID"), new Source(), str("BUFFER"), new Target(), opt(length));
    const deallocate = seq(str("DEALLOCATE ID"), new Source());
    const accept = seq(str("ACCEPT ID"), new Source());

    const receive = seq(str("RECEIVE ID"),
                        new Source(),
                        str("BUFFER"),
                        new Source(),
                        opt(length),
                        str("DATAINFO"),
                        new Target(),
                        str("STATUSINFO"),
                        new Target(),
                        str("RECEIVED"),
                        new Target());

    const ret = seq(str("COMMUNICATION"),
                    alt(init, allocate, send, deallocate, receive, accept));

    return verNot(Version.Cloud, ret);
  }

}