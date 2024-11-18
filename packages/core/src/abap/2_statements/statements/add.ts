import {IStatement} from "./_statement";
import {seq, altPrio, alt, opt} from "../combi";
import {Target, Source, FieldSub} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Add implements IStatement {

  public getMatcher(): IStatementRunnable {
    const to = seq("TO", Target);
    const accordingTo = seq("ACCORDING TO", FieldSub);
    const giving = seq("GIVING", FieldSub, opt(accordingTo));
    const then = seq("THEN", FieldSub, "UNTIL", FieldSub, alt(giving, to));

    const ret = seq("ADD", Source, altPrio(to, then));

    return ret;
  }

}