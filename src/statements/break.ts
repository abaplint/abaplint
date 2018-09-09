import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, alt, IRunnable} from "../combi";

export class Break extends Statement {

  public static get_matcher(): IRunnable {
    let id = seq(str("ID"), new Reuse.Field());
    let next = str("AT NEXT APPLICATION STATEMENT");
    let log = new Reuse.Source();

    return alt(seq(str("BREAK-POINT"), opt(alt(id, next, log))),
               seq(str("BREAK"), new Reuse.Field()));
  }

}