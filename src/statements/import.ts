import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let plus = Combi.plus;

export class Import extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let id = seq(str("ID"), Reuse.source());

    let buffer = seq(str("DATA BUFFER"), Reuse.source());
    let memory = seq(str("MEMORY ID"), Reuse.source());
    let database = seq(str("DATABASE"), Reuse.source(), str("TO"), Reuse.target(), id);
    let source = alt(buffer, memory, database);

    let to = plus(seq(Reuse.source(), str("TO"), Reuse.target()));
    let target = alt(Reuse.parameter_list_t(), to);

    return seq(str("IMPORT"), target, str("FROM"), source);
  }

}