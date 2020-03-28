import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Condense implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CONDENSE"),
               new Target(),
               opt(str("NO-GAPS")));
  }

}