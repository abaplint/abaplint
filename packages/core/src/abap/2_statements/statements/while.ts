import {IStatement} from "./_statement";
import {seqs, opt} from "../combi";
import {Cond, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class While implements IStatement {

  public getMatcher(): IStatementRunnable {
    const vary = seqs("VARY", Target, "FROM", Source, "NEXT", Source);

    return seqs("WHILE", Cond, opt(vary));
  }

}