import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Condense implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("CONDENSE",
               Target,
               opt("NO-GAPS"));
  }

}