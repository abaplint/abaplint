import {IStatement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Target} from "../expressions";

export class Condense implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CONDENSE"),
               new Target(),
               opt(str("NO-GAPS")));
  }

}