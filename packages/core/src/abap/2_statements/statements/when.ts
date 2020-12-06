import {IStatement} from "./_statement";
import {seq, starPrios} from "../combi";
import {Source, Or} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class When implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sourc = seq(Source, starPrios(Or));

    return seq("WHEN", sourc);
  }

}