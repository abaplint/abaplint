import {IStatement} from "./_statement";
import {str, verNot, seqs, plus, altPrio} from "../combi";
import {Field, Source, Target, ConstantOrFieldSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Provide implements IStatement {

  public getMatcher(): IStatementRunnable {

    const list = plus(altPrio(str("*"), new Field()));

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

    const fieldList = altPrio(seqs(list, "FROM", Source), list);

    const ret = seqs("PROVIDE",
                     altPrio(plus(fields), plus(fieldList)),
                     "BETWEEN",
                     ConstantOrFieldSource,
                     "AND",
                     ConstantOrFieldSource);

    return verNot(Version.Cloud, ret);
  }

}