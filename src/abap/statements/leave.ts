import {Statement} from "./statement";
import {verNot, str, seq, alt, opt, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Leave extends Statement {

  public getMatcher(): IRunnable {
    let retu = seq(str("AND RETURN TO SCREEN"), new Source());

    let transaction = seq(str("TO TRANSACTION"),
                          new Source(),
                          opt(str("AND SKIP FIRST SCREEN")));

    let ret = seq(str("LEAVE"),
                  opt(alt(str("TO CURRENT TRANSACTION"),
                          seq(opt(str("TO")), str("LIST-PROCESSING"), opt(retu)),
                          str("LIST-PROCESSING"),
                          str("SCREEN"),
                          transaction,
                          str("PROGRAM"),
                          seq(str("TO SCREEN"), new Source()))));

    return verNot(Version.Cloud, ret);
  }

}