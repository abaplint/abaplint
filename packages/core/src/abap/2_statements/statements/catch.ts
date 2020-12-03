import {IStatement} from "./_statement";
import {str, opt, seq, plus, optPrio} from "../combi";
import {Target, ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Catch implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CATCH"),
               optPrio(str("BEFORE UNWIND")),
               plus(new ClassName()),
               opt(seq(str("INTO"), new Target())));
  }

}