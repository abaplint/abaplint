import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Scan extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let tokens = seq(str("TOKENS INTO"), Reuse.target());
    let statements = seq(str("STATEMENTS INTO"), Reuse.target());
    let levels = seq(str("LEVELS INTO"), Reuse.target());
    let structures = seq(str("STRUCTURES INTO"), Reuse.target());

    let ret = seq(str("SCAN ABAP-SOURCE"),
                  Reuse.source(),
                  tokens,
                  statements,
                  opt(levels),
                  opt(structures),
                  str("WITH ANALYSIS"),
                  opt(str("WITH COMMENTS")),
                  opt(seq(str("WITH PRAGMAS"), Reuse.field())));

    return ret;
  }

}