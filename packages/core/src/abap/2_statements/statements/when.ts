import {IStatement} from "./_statement";
import {str, seq, starPrio} from "../combi";
import {Source, Or} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class When implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sourc = seq(new Source(), starPrio(new Or()));

    return seq(str("WHEN"), sourc);
  }

}