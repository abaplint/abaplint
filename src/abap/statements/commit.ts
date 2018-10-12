import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import {Source, Dynamic} from "../expressions";

export class Commit extends Statement {

  public get_matcher(): IRunnable {
    let work = seq(str("WORK"), opt(str("AND WAIT")));

    let connection = seq(str("CONNECTION"), alt(new Source(), new Dynamic()));

    return seq(str("COMMIT"), alt(work, connection));
  }

}