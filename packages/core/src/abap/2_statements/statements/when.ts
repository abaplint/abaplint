import {IStatement} from "./_statement";
import {str, seq, star} from "../combi";
import {Source, Or} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class When implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sourc = seq(new Source(), star(new Or()));

    return seq(str("WHEN"), sourc);
  }

}