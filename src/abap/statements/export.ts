import {Statement} from "./_statement";
import {str, seq, alt, altPrio, opt, per, plus, IStatementRunnable} from "../combi";
import {Target, Source, Field, Dynamic, ParameterName, ParameterS} from "../expressions";

// todo, cloud, split?
export class Export extends Statement {

  public getMatcher(): IStatementRunnable {
    const id = seq(str("ID"), new Source());

    const db = seq(str("DATA BUFFER"), new Target());
    const memory = seq(str("MEMORY ID"), new Source());
    const from = seq(str("FROM"), new Source());
    const using = seq(str("USING"), new Source());
    const client = seq(str("CLIENT"), new Source());
    const table = seq(str("INTERNAL TABLE"), new Target());

    const shared = seq(alt(str("SHARED MEMORY"), str("SHARED BUFFER")),
                       new Field(),
                       str("("),
                       new Field(),
                       str(")"),
                       str("ID"),
                       new Source());

    const database = seq(str("DATABASE"),
                         new Source(),
                         per(from, client, id, using));

    const target = alt(db, memory, database, table, shared);

    const source = alt(plus(altPrio(new ParameterS(), new ParameterName())),
                       new Dynamic());

    const compression = seq(str("COMPRESSION"), alt(str("ON"), str("OFF")));
    const hint = seq(str("CODE PAGE HINT"), new Source());

    return seq(str("EXPORT"),
               source,
               opt(from),
               str("TO"),
               target,
               opt(compression),
               opt(hint));
  }

}