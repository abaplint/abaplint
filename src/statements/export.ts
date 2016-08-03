import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Export extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let id = seq(str("ID"), Reuse.source());

    let db = seq(str("DATA BUFFER"), Reuse.target());
    let memory = seq(str("MEMORY ID"), Reuse.source());
    let database = seq(str("DATABASE"), Reuse.source(), str("FROM"), Reuse.source(), id);
    let target = alt(db, memory, database);

    let source = alt(Reuse.parameter_list_s(), Reuse.source());

    return seq(str("EXPORT"), source, str("TO"), target, opt(str("COMPRESSION ON")));
  }

}