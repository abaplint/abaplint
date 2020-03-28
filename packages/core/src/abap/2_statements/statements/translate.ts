import {IStatement} from "./_statement";
import {str, seq, alt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Translate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const cas = seq(str("TO"),
                    alt(str("UPPER"), str("LOWER")),
                    str("CASE"));

    const using = seq(str("USING"), new Source());

    return seq(str("TRANSLATE"),
               new Target(),
               alt(cas, using));
  }

}