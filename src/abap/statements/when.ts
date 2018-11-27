import {Statement} from "./_statement";
import {str, seq, star, IStatementRunnable} from "../combi";
import {Source} from "../expressions";

export class When extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("WHEN"),
               new Source(),
               star(seq(str("OR"), new Source())));
  }

}