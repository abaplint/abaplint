import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;

export class Replace extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let length = seq(str("LENGTH"), new Reuse.Source());
    let offset = seq(str("OFFSET"), new Reuse.Source());

    let section = seq(opt(str("IN")),
                      str("SECTION"),
                      per(offset, length),
                      str("OF"),
                      new Reuse.Source());

    let source = seq(opt(str("OF")),
                     opt(str("REGEX")),
                     new Reuse.Source());

    let cas = alt(str("IGNORING CASE"),
                  str("RESPECTING CASE"));

    let occ = alt(str("ALL OCCURRENCES"),
                  str("FIRST OCCURRENCE"));

    return seq(str("REPLACE"),
               per(section, seq(opt(occ), source)),
               opt(seq(str("IN"), opt(str("TABLE")), new Reuse.Target())),
               per(seq(str("WITH"), new Reuse.Source()),
                   seq(str("INTO"), new Reuse.Target())),
               opt(cas),
               opt(str("IN CHARACTER MODE")));
  }

}