import {IStatement} from "./_statement";
import {verNot, seq, pluss, altPrios} from "../combi";
import {Field, Source, Target, ConstantOrFieldSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Provide implements IStatement {

  public getMatcher(): IStatementRunnable {

    const list = pluss(altPrios("*", Field));

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

    const fieldList = altPrios(seq(list, "FROM", Source), list);

    const ret = seq("PROVIDE",
                    altPrios(pluss(fields), pluss(fieldList)),
                    "BETWEEN",
                    ConstantOrFieldSource,
                    "AND",
                    ConstantOrFieldSource);

    return verNot(Version.Cloud, ret);
  }

}