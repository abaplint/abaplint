import {Statement} from "./statement";
import {str, seq, opt, per, IRunnable} from "../combi";
import {Integer, MessageClass, NamespaceSimpleName} from "../expressions";

export class Report extends Statement {

  public static get_matcher(): IRunnable {
    let heading = str("NO STANDARD PAGE HEADING");
    let size = seq(str("LINE-SIZE"), new Integer());
    let count = seq(str("LINE-COUNT"), new Integer());
    let message = seq(str("MESSAGE-ID"), new MessageClass());

    return seq(str("REPORT"),
               opt(new NamespaceSimpleName()),
               opt(per(heading, size, count, message)));
  }

}