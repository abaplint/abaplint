import {IStatement} from "./_statement";
import {optPrio, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource2} from "../expressions/simple_source2";

export class DynproLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq("INTO", SimpleSource2);

    return seq(
      "LOOP AT",
      SimpleSource2,
      optPrio(into),
      "WITH CONTROL",
      SimpleSource2,
      "CURSOR",
      SimpleSource2,);
  }

}