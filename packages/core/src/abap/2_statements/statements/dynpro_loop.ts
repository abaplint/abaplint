import {IStatement} from "./_statement";
import {seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource2} from "../expressions/simple_source2";

export class DynproLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("LOOP AT", SimpleSource2, "WITH CONTROL", SimpleSource2, "CURSOR", SimpleSource2,);
  }

}