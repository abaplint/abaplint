import {Statement} from "./_statement";
import {str, seq, alt, IRunnable} from "../combi";
import {Dynamic, Field} from "../expressions";

export class Rollback extends Statement {

  public getMatcher(): IRunnable {
    let connection = seq(str("CONNECTION"),
                         alt(new Dynamic(), new Field()));

    return seq(str("ROLLBACK"), alt(str("WORK"), connection));
  }

}