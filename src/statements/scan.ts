import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let per = Combi.per;

export class Scan extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let tokens = seq(str("TOKENS INTO"), new Reuse.Target());
    let statements = seq(str("STATEMENTS INTO"), new Reuse.Target());
    let levels = seq(str("LEVELS INTO"), new Reuse.Target());
    let structures = seq(str("STRUCTURES INTO"), new Reuse.Target());
    let keywords = seq(str("KEYWORDS FROM"), new Reuse.Source());
    let pragmas = seq(str("WITH PRAGMAS"), new Reuse.Field());

    let ret = seq(str("SCAN ABAP-SOURCE"),
                  new Reuse.Source(),
                  per(tokens,
                      levels,
                      statements,
                      structures,
                      keywords,
                      str("WITH ANALYSIS"),
                      str("WITH COMMENTS"),
                      str("WITH INCLUDES"),
                      str("WITHOUT TRMAC"),
                      pragmas));

    return ret;
  }

}