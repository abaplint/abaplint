import {IStatement} from "./_statement";
import {verNot, seq, plus, altPrio, opt, per} from "../combi";
import {Field, Source, Target, SimpleSource3, Cond} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Provide implements IStatement {

  public getMatcher(): IStatementRunnable {

    const list = plus(altPrio("*", Field));

    const fields = seq("FIELDS",
                       list,
                       "FROM",
                       Source,
                       "INTO",
                       Target,
                       "VALID",
                       Field,
                       "BOUNDS",
                       Field,
                       "AND",
                       Field);

    const fieldList = altPrio(seq(list, "FROM", Source), list);

    const where = seq("WHERE", Cond);
    const between = seq("BETWEEN", SimpleSource3, "AND", SimpleSource3);

    const ret = seq("PROVIDE",
                    altPrio(plus(fields), plus(fieldList)),
                    opt(per(between, where)));

    return verNot(Version.Cloud, ret);
  }

}