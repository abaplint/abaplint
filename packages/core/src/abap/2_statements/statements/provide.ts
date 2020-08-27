import {IStatement} from "./_statement";
import {str, verNot, seq, plus, altPrio} from "../combi";
import {Field, Source, Target, ConstantOrFieldSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Provide implements IStatement {

  public getMatcher(): IStatementRunnable {

    const list = altPrio(str("*"), new Field());

    const fields = seq(str("FIELDS"),
                       list,
                       str("FROM"),
                       new Source(),
                       str("INTO"),
                       new Target(),
                       str("VALID"),
                       new Field(),
                       str("BOUNDS"),
                       new Field(),
                       str("AND"),
                       new Field());

    const fieldList = altPrio(seq(list, str("FROM"), new Source()), list);

    const ret = seq(str("PROVIDE"),
                    altPrio(plus(fields), plus(fieldList)),
                    str("BETWEEN"),
                    new ConstantOrFieldSource(),
                    str("AND"),
                    new ConstantOrFieldSource());

    return verNot(Version.Cloud, ret);
  }

}