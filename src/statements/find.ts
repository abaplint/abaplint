import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, alt, per, plus, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Find extends Statement {

  public static get_matcher(): IRunnable {
    let options = per(str("IGNORING CASE"),
                      str("RESPECTING CASE"),
                      str("IN BYTE MODE"),
                      str("IN CHARACTER MODE"),
                      seq(str("OF"), new Reuse.Source()),
                      seq(str("FROM"), new Reuse.Source()),
                      seq(str("MATCH OFFSET"), new Target()),
                      seq(str("MATCH LINE"), new Target()),
                      seq(str("MATCH COUNT"), new Target()),
                      seq(str("MATCH LENGTH"), new Target()),
                      seq(str("LENGTH"), new Reuse.Source()),
                      seq(str("RESULTS"), new Target()),
                      seq(str("SUBMATCHES"), plus(new Target())));

    let sectionLength = seq(str("SECTION LENGTH"), new Reuse.Source(), str("OF"));

    let before = seq(opt(alt(str("TABLE"),
                             str("SECTION OFFSET"),
                             sectionLength)),
                     new Reuse.Source());

    let ret = seq(str("FIND"),
                  opt(alt(str("FIRST OCCURRENCE OF"),
                          str("ALL OCCURRENCES OF"))),
                  opt(alt(str("REGEX"), str("SUBSTRING"))),
                  new Reuse.Source(),
                  str("IN"),
                  before,
                  opt(options));

    return ret;
  }

}