import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class Import extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let id = seq(str("ID"), new Reuse.Source());

    let buffer = seq(str("DATA BUFFER"), new Reuse.Source());
    let memory = seq(str("MEMORY ID"), new Reuse.Source());

    let database = seq(str("DATABASE"),
                       new Reuse.Source(),
                       opt(seq(str("TO"), new Reuse.Target())),
                       id);

    let source = alt(buffer, memory, database);

    let to = plus(seq(new Reuse.Source(), str("TO"), new Reuse.Target()));

    let target = alt(new Reuse.ParameterListT(), to, new Reuse.Dynamic(), new Reuse.Target());

    return seq(str("IMPORT"), target, str("FROM"), source);
  }

}