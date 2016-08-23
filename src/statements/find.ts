import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class Find extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("FIND"),
                  opt(alt(str("FIRST OCCURRENCE OF"),
                          str("ALL OCCURRENCES OF"))),
                  opt(str("REGEX")),
                  Reuse.source(),
                  str("IN"),
                  opt(str("TABLE")),
                  Reuse.source(),
                  opt(str("IGNORING CASE")),
                  opt(seq(str("MATCH OFFSET"), Reuse.target())),
                  opt(seq(str("MATCH COUNT"), Reuse.target())),
                  opt(seq(str("MATCH LENGTH"), Reuse.target())),
                  opt(seq(str("RESULTS"), Reuse.target())),
                  opt(seq(str("SUBMATCHES"), plus(Reuse.target()))));

    return ret;
  }

}