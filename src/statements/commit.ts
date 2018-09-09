import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Commit extends Statement {

  public static get_matcher(): IRunnable {
    let work = seq(str("WORK"), opt(str("AND WAIT")));

    let connection = seq(str("CONNECTION"), alt(new Reuse.Source(), new Reuse.Dynamic()));

    return seq(str("COMMIT"), alt(work, connection));
  }

}