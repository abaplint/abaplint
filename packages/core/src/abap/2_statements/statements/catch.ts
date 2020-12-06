import {IStatement} from "./_statement";
import {opts, seqs, pluss, optPrios} from "../combi";
import {Target, ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Catch implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("CATCH",
                optPrios("BEFORE UNWIND"),
                pluss(ClassName),
                opts(seqs("INTO", Target)));
  }

}