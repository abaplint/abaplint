import {IStatement} from "./_statement";
import {opt, seq, pluss, optPrios} from "../combi";
import {Target, ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Catch implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("CATCH",
               optPrios("BEFORE UNWIND"),
               pluss(ClassName),
               opt(seq("INTO", Target)));
  }

}