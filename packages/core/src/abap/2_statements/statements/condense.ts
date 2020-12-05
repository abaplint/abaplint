import {IStatement} from "./_statement";
import {str, seqs, opt} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Condense implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("CONDENSE",
                Target,
                opt(str("NO-GAPS")));
  }

}