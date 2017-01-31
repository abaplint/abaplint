import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;

export class Loop extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let where = seq(str("WHERE"), alt(new Reuse.Cond(), new Reuse.Dynamic()));

    let group = seq(str("GROUP BY"), new Reuse.Source());

    let into = alt(seq(alt(seq(opt(str("REFERENCE")), str("INTO")), str("ASSIGNING")),
                       new Reuse.Target(),
                       opt(group),
                       opt(str("CASTING"))),
                   str("TRANSPORTING NO FIELDS"));

    let from = seq(str("FROM"), new Reuse.Source());

    let to = seq(str("TO"), new Reuse.Source());

    let usingKey = seq(str("USING KEY"), alt(new Reuse.Source(), new Reuse.Dynamic()));

    let options = per(into, from, to, where, usingKey);

    let at = seq(str("AT"),
                 opt(str("GROUP")),
                 new Reuse.Source(),
                 opt(options));

    return seq(str("LOOP"), opt(at));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}