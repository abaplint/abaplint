import {Statement} from "./_statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import {Source, Dynamic} from "../expressions";

export class Commit extends Statement {

  public getMatcher(): IRunnable {
    const work = seq(str("WORK"), opt(str("AND WAIT")));

    const connection = seq(str("CONNECTION"), alt(new Source(), new Dynamic()));

    return seq(str("COMMIT"), alt(work, connection));
  }

}