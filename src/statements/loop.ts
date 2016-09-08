import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;

export class Loop extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let where = seq(str("WHERE"), new Reuse.Cond());

    let into = alt(seq(alt(seq(opt(str("REFERENCE")), str("INTO")), str("ASSIGNING")), new Reuse.Target()),
                   str("TRANSPORTING NO FIELDS"));

    let from = seq(str("FROM"), new Reuse.Source());

    let to = seq(str("TO"), new Reuse.Source());

    let usingKey = seq(str("USING KEY"), new Reuse.Source());

    let options = per(into, from, to, where, usingKey);

    return seq(str("LOOP AT"),
               new Reuse.Source(),
               opt(options));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}