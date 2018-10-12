import {Statement} from "./statement";
import {verNot, str, seq, alt, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Communication extends Statement {

  public getMatcher(): IRunnable {
    let length = seq(str("LENGTH"), new Target());

    let init = seq(str("INIT ID"), new Source(), str("DESTINATION"), new Target());
    let allocate = seq(str("ALLOCATE ID"), new Source());
    let send = seq(str("SEND ID"), new Source(), str("BUFFER"), new Target(), opt(length));
    let deallocate = seq(str("DEALLOCATE ID"), new Source());
    let accept = seq(str("ACCEPT ID"), new Source());

    let receive = seq(str("RECEIVE ID"),
                      new Source(),
                      str("BUFFER"),
                      new Source(),
                      str("DATAINFO"),
                      new Target(),
                      str("STATUSINFO"),
                      new Target(),
                      str("RECEIVED"),
                      new Target());

    let ret = seq(str("COMMUNICATION"),
                  alt(init, allocate, send, deallocate, receive, accept));

    return verNot(Version.Cloud, ret);
  }

}