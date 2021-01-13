import {IStatement} from "./_statement";
import {verNot, seq, plus, altPrio} from "../combi";
import {Field, Source, Target, SimpleSource3} from "../expressions";
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

    const ret = seq("PROVIDE",
                    altPrio(plus(fields), plus(fieldList)),
                    "BETWEEN",
                    SimpleSource3,
                    "AND",
                    SimpleSource3);

    return verNot(Version.Cloud, ret);
  }

}