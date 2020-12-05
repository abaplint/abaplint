import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ConvertText implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("CONVERT TEXT",
                Source,
                "INTO SORTABLE CODE",
                Target);
  }

}