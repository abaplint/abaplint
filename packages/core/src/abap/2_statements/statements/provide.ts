import {IStatement} from "./_statement";
import {verNot, seq, pluss, altPrio} from "../combi";
import {Field, Source, Target, ConstantOrFieldSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Provide implements IStatement {

  public getMatcher(): IStatementRunnable {

    const list = pluss(altPrio("*", Field));

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
                    altPrio(pluss(fields), pluss(fieldList)),
                    "BETWEEN",
                    ConstantOrFieldSource,
                    "AND",
                    ConstantOrFieldSource);

    return verNot(Version.Cloud, ret);
  }

}