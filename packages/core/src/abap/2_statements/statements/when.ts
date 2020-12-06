import {IStatement} from "./_statement";
import {seqs, starPrios} from "../combi";
import {Source, Or} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class When implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sourc = seqs(Source, starPrios(Or));

    return seqs("WHEN", sourc);
  }

}