import {IStatement} from "./_statement";
import {seq, altPrio} from "../combi";
import {Target, Source, FieldSub} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Add implements IStatement {

  public getMatcher(): IStatementRunnable {
    const to = seq("TO", Target);
    const then = seq("THEN", FieldSub, "UNTIL", FieldSub, "GIVING", FieldSub);

    const ret = seq("ADD", Source, altPrio(to, then));

    return ret;
  }

}