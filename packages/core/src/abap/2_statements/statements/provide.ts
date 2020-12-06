import {IStatement} from "./_statement";
import {verNot, seqs, pluss, altPrios} from "../combi";
import {Field, Source, Target, ConstantOrFieldSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Provide implements IStatement {

  public getMatcher(): IStatementRunnable {

    const list = pluss(altPrios("*", Field));

    const fields = seqs("FIELDS",
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

    const fieldList = altPrios(seqs(list, "FROM", Source), list);

    const ret = seqs("PROVIDE",
                     altPrios(pluss(fields), pluss(fieldList)),
                     "BETWEEN",
                     ConstantOrFieldSource,
                     "AND",
                     ConstantOrFieldSource);

    return verNot(Version.Cloud, ret);
  }

}