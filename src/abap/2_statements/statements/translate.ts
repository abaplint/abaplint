import {Statement} from "./_statement";
import {str, seq, alt, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Translate extends Statement {

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