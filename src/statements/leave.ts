import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {Source} from "../expressions";

export class Leave extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("AND RETURN TO SCREEN"), new Source());

    let transaction = seq(str("TO TRANSACTION"),
                          new Source(),
                          opt(str("AND SKIP FIRST SCREEN")));

    return seq(str("LEAVE"),
               opt(alt(str("TO CURRENT TRANSACTION"),
                       seq(opt(str("TO")), str("LIST-PROCESSING"), opt(ret)),
                       str("LIST-PROCESSING"),
                       str("SCREEN"),
                       transaction,
                       str("PROGRAM"),
                       seq(str("TO SCREEN"), new Source()))));
  }

}