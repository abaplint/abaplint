import {Statement} from "./_statement";
import {str, seq, star, IStatementRunnable, altPrio} from "../combi";
import {Source} from "../expressions";

export class When extends Statement {

  public getMatcher(): IStatementRunnable {
    const sourc = seq(new Source(), star(seq(str("OR"), new Source())));
    return seq(str("WHEN"),
               altPrio(str("OTHERS"), sourc));
  }

}