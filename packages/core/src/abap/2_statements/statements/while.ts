import {IStatement} from "./_statement";
import {seq, opts} from "../combi";
import {Cond, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class While implements IStatement {

  public getMatcher(): IStatementRunnable {
    const vary = seq("VARY", Target, "FROM", Source, "NEXT", Source);

    return seq("WHILE", Cond, opts(vary));
  }

}