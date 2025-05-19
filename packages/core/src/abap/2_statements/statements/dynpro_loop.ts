import {IStatement} from "./_statement";
import {per, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource2} from "../expressions/simple_source2";

export class DynproLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq("INTO", SimpleSource2);
    const cursor = seq("CURSOR", SimpleSource2);
    const withControl = seq("WITH CONTROL", SimpleSource2);
    const fromTo = seq("FROM", SimpleSource2, "TO", SimpleSource2);

    return seq(
      "LOOP AT",
      SimpleSource2,
      per(into, withControl, cursor, fromTo));
  }

}