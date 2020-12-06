import {IStatement} from "./_statement";
import {seqs, starPrio} from "../combi";
import {Source, Or} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class When implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sourc = seqs(Source, starPrio(new Or()));

    return seqs("WHEN", sourc);
  }

}