import {IStatement} from "./_statement";
import {opt, seq, plus, optPrio} from "../combi";
import {Target, ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Catch implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("CATCH",
               optPrio("BEFORE UNWIND"),
               plus(ClassName),
               opt(seq("INTO", Target)));
  }

}