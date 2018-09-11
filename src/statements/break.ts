import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import {Field, Source} from "../expressions";

export class Break extends Statement {

  public static get_matcher(): IRunnable {
    let id = seq(str("ID"), new Field());
    let next = str("AT NEXT APPLICATION STATEMENT");
    let log = new Source();

    return alt(seq(str("BREAK-POINT"), opt(alt(id, next, log))),
               seq(str("BREAK"), new Field()));
  }

}