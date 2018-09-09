import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, alt, per, plus, IRunnable} from "../combi";

export class Import extends Statement {

  public static get_matcher(): IRunnable {
    let id = seq(str("ID"), new Reuse.Source());
    let dto = seq(str("TO"), new Reuse.Target());
    let client = seq(str("CLIENT"), new Reuse.Source());

    let options = per(str("ACCEPTING PADDING"),
                      str("IGNORING CONVERSION ERRORS"),
                      str("ACCEPTING TRUNCATION"));

    let shared = seq(str("SHARED MEMORY"),
                     new Reuse.Field(),
                     str("("),
                     new Reuse.Field(),
                     str(")"),
                     str("ID"),
                     new Reuse.Field());

    let buffer = seq(str("DATA BUFFER"), new Reuse.Source());
    let memory = seq(str("MEMORY ID"), new Reuse.Source());
    let table = seq(str("INTERNAL TABLE"), new Reuse.Source());

    let database = seq(str("DATABASE"),
                       new Reuse.Source(),
                       per(dto, id, client),
                       opt(options));

    let source = alt(buffer, memory, database, table, shared);

    let to = plus(seq(new Reuse.Source(),
                      alt(str("TO"), str("INTO")),
                      new Reuse.Target()));

    let target = alt(new Reuse.ParameterListT(),
                     to,
                     new Reuse.Dynamic(),
                     plus(new Reuse.Target()));

    return seq(str("IMPORT"), target, str("FROM"), source);
  }

}