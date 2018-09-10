import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Communication extends Statement {

  public static get_matcher(): IRunnable {
    let length = seq(str("LENGTH"), new Target());

    let init = seq(str("INIT ID"), new Reuse.Source(), str("DESTINATION"), new Target());
    let allocate = seq(str("ALLOCATE ID"), new Reuse.Source());
    let send = seq(str("SEND ID"), new Reuse.Source(), str("BUFFER"), new Target(), opt(length));
    let deallocate = seq(str("DEALLOCATE ID"), new Reuse.Source());
    let accept = seq(str("ACCEPT ID"), new Reuse.Source());

    let receive = seq(str("RECEIVE ID"),
                      new Reuse.Source(),
                      str("BUFFER"),
                      new Reuse.Source(),
                      str("DATAINFO"),
                      new Target(),
                      str("STATUSINFO"),
                      new Target(),
                      str("RECEIVED"),
                      new Target());

    return seq(str("COMMUNICATION"),
               alt(init, allocate, send, deallocate, receive, accept));
  }

}