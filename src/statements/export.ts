import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;
let plus = Combi.plus;

export class Export extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let id = seq(str("ID"), new Reuse.Source());

    let db = seq(str("DATA BUFFER"), new Reuse.Target());
    let memory = seq(str("MEMORY ID"), new Reuse.Source());
    let from = seq(str("FROM"), new Reuse.Source());
    let client = seq(str("CLIENT"), new Reuse.Source());
    let table = seq(str("INTERNAL TABLE"), new Reuse.Target());

    let shared = seq(str("SHARED MEMORY"),
                     new Reuse.Field(),
                     str("("),
                     new Reuse.Field(),
                     str(")"),
                     str("ID"),
                     new Reuse.Field());

    let database = seq(str("DATABASE"),
                       new Reuse.Source(),
                       per(from, client, id));

    let target = alt(db, memory, database, table, shared);

    let source = alt(new Reuse.ParameterListS(),
                     plus(new Reuse.Source()),
                     new Reuse.Dynamic());

    let compression = seq(str("COMPRESSION"), alt(str("ON"), str("OFF")));

    return seq(str("EXPORT"),
               source,
               str("TO"),
               target,
               opt(compression));
  }

}