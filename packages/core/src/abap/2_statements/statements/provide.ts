import {IStatement} from "./_statement";
import {verNot, seq, plus, altPrio, opt, per, plusPrio} from "../combi";
import {Field, Source, Target, SimpleSource3, Cond, ProvideFieldName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Provide implements IStatement {

  public getMatcher(): IStatementRunnable {

    const list = plusPrio(altPrio("*", ProvideFieldName));

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

    const from = seq("FROM", Source);

    const fieldList = seq(plus(list), from);

    const where = seq("WHERE", Cond);
    const between = seq("BETWEEN", SimpleSource3, "AND", SimpleSource3);

    const ret = seq("PROVIDE",
                    altPrio(plusPrio(fields), plusPrio(fieldList)),
                    opt(per(between, where)));

    return verNot(Version.Cloud, ret);
  }

}