import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable, opt} from "../combi";
import {Cond, Source, Target} from "../expressions";

export class While implements IStatement {

  public getMatcher(): IStatementRunnable {
    const vary = seq(str("VARY"), new Target(), str("FROM"), new Source(), str("NEXT"), new Source());

    return seq(str("WHILE"), new Cond(), opt(vary));
  }

}