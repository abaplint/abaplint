import {Statement} from "./statement";
import {str, seq, alt, opt, per, plus, IRunnable} from "../combi";
import {Target, Source, ParameterListS, Field, Dynamic} from "../expressions";

// todo, cloud, split?
export class Export extends Statement {

  public get_matcher(): IRunnable {
    let id = seq(str("ID"), new Source());

    let db = seq(str("DATA BUFFER"), new Target());
    let memory = seq(str("MEMORY ID"), new Source());
    let from = seq(str("FROM"), new Source());
    let using = seq(str("USING"), new Source());
    let client = seq(str("CLIENT"), new Source());
    let table = seq(str("INTERNAL TABLE"), new Target());

    let shared = seq(alt(str("SHARED MEMORY"), str("SHARED BUFFER")),
                     new Field(),
                     str("("),
                     new Field(),
                     str(")"),
                     str("ID"),
                     new Source());

    let database = seq(str("DATABASE"),
                       new Source(),
                       per(from, client, id, using));

    let target = alt(db, memory, database, table, shared);

    let source = alt(new ParameterListS(),
                     plus(new Source()),
                     new Dynamic());

    let compression = seq(str("COMPRESSION"), alt(str("ON"), str("OFF")));
    let hint = seq(str("CODE PAGE HINT"), new Source());

    return seq(str("EXPORT"),
               source,
               opt(from),
               str("TO"),
               target,
               opt(compression),
               opt(hint));
  }

}