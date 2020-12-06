import {IStatement} from "./_statement";
import {str, opts, seqs, plus, optPrio} from "../combi";
import {Target, ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Catch implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("CATCH",
                optPrio(str("BEFORE UNWIND")),
                plus(new ClassName()),
                opts(seqs("INTO", Target)));
  }

}