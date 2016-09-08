import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class DeleteDatabase extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let where = seq(str("WHERE"), alt(new Reuse.Cond(), new Reuse.Dynamic()));
    let source = alt(new Reuse.Dynamic(), new Reuse.DatabaseTable());

    let ret = seq(str("DELETE"), str("FROM"), source, opt(where));

    return ret;
  }

}