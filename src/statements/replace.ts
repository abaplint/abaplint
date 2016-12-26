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

    let option = alt(str("ALL OCCURRENCES"),
                     str("FIRST OCCURRENCE"),
                     seq(str("SECTION OFFSET"), new Reuse.Source(), opt(length)));

    return seq(str("REPLACE"),
               opt(option),
               opt(str("OF")),
               opt(str("REGEX")),
               new Reuse.Source(),
               opt(seq(str("IN"), new Reuse.Target())),
               per(seq(str("WITH"), new Reuse.Source()),
                   seq(str("INTO"), new Reuse.Target())),
               opt(str("IGNORING CASE")),
               opt(str("IN CHARACTER MODE")));
  }

}