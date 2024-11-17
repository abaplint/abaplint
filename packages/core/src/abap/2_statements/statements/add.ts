import {IStatement} from "./_statement";
import {seq, altPrio, alt} from "../combi";
import {Target, Source, FieldSub} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Add implements IStatement {

  public getMatcher(): IStatementRunnable {
    const to = seq("TO", Target);
    const giving = seq("GIVING", FieldSub);
    const then = seq("THEN", FieldSub, "UNTIL", FieldSub, alt(giving, to));

    const ret = seq("ADD", Source, altPrio(to, then));

    return ret;
  }

}