import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;
let plus = Combi.plus;

export class Find extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let options = per(str("IGNORING CASE"),
                      seq(str("MATCH OFFSET"), Reuse.target()),
                      seq(str("MATCH COUNT"), Reuse.target()),
                      seq(str("MATCH LENGTH"), Reuse.target()),
                      seq(str("RESULTS"), Reuse.target()),
                      seq(str("SUBMATCHES"), plus(Reuse.target())));

    let ret = seq(str("FIND"),
                  opt(alt(str("FIRST OCCURRENCE OF"),
                          str("ALL OCCURRENCES OF"))),
                  opt(str("REGEX")),
                  Reuse.source(),
                  str("IN"),
                  opt(str("TABLE")),
                  Reuse.source(),
                  opt(options));

    return ret;
  }

}