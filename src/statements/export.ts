import {Statement} from "./statement";
import {str, seq, alt, opt, per, plus, IRunnable} from "../combi";
import {Target, Source, ParameterListS, Field, Dynamic} from "../expressions";

export class Export extends Statement {

  public static get_matcher(): IRunnable {
    let id = seq(str("ID"), new Source());

    let db = seq(str("DATA BUFFER"), new Target());
    let memory = seq(str("MEMORY ID"), new Source());
    let from = seq(str("FROM"), new Source());
    let client = seq(str("CLIENT"), new Source());
    let table = seq(str("INTERNAL TABLE"), new Target());

    let shared = seq(str("SHARED MEMORY"),
                     new Field(),
                     str("("),
                     new Field(),
                     str(")"),
                     str("ID"),
                     new Field());

    let database = seq(str("DATABASE"),
                       new Source(),
                       per(from, client, id));

    let target = alt(db, memory, database, table, shared);

    let source = alt(new ParameterListS(),
                     plus(new Source()),
                     new Dynamic());

    let compression = seq(str("COMPRESSION"), alt(str("ON"), str("OFF")));

    return seq(str("EXPORT"),
               source,
               str("TO"),
               target,
               opt(compression));
  }

}