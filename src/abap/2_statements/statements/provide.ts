import {IStatement} from "./_statement";
import {str, verNot, seq, alt, IStatementRunnable, plus} from "../combi";
import {Field, Source, Target} from "../expressions";
import {Version} from "../../../version";

export class Provide implements IStatement {

  public getMatcher(): IStatementRunnable {

    const list = str("*");

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

    const fieldList = seq(new Field(), str("FROM"), new Source());

    const ret = seq(str("PROVIDE"),
                    alt(plus(fields), plus(fieldList)),
                    str("BETWEEN"),
                    new Field(),
                    str("AND"),
                    new Field());

    return verNot(Version.Cloud, ret);
  }

}