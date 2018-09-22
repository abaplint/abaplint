import {Statement} from "./statement";
import {verNot, str, seq, opt, alt, IRunnable} from "../combi";
import {Field, Source} from "../expressions";
import {Version} from "../../version";

export class Break extends Statement {

  public static get_matcher(): IRunnable {
    let id = seq(str("ID"), new Field());
    let next = str("AT NEXT APPLICATION STATEMENT");
    let log = new Source();

    let ret = alt(seq(str("BREAK-POINT"), opt(alt(id, next, log))),
                  seq(str("BREAK"), new Field()));

    return verNot(Version.Cloud, ret);
  }

}