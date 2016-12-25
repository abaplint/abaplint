import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Scan extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let tokens = seq(str("TOKENS INTO"), new Reuse.Target());
    let statements = seq(str("STATEMENTS INTO"), new Reuse.Target());
    let levels = seq(str("LEVELS INTO"), new Reuse.Target());
    let structures = seq(str("STRUCTURES INTO"), new Reuse.Target());
    let keywords = seq(str("KEYWORDS FROM"), new Reuse.Source());

    let ret = seq(str("SCAN ABAP-SOURCE"),
                  new Reuse.Source(),
                  tokens,
                  statements,
                  opt(levels),
                  opt(structures),
                  opt(keywords),
                  opt(str("WITH ANALYSIS")),
                  opt(str("WITH COMMENTS")),
                  opt(str("WITH INCLUDES")),
                  opt(str("WITHOUT TRMAC")),
                  opt(seq(str("WITH PRAGMAS"), new Reuse.Field())));

    return ret;
  }

}