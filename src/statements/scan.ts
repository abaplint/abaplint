import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let per = Combi.per;

export class Scan extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let tokens = seq(str("TOKENS INTO"), new Reuse.Target());
    let word = seq(str("WORD INTO"), new Reuse.Target());
    let line = seq(str("LINE INTO"), new Reuse.Target());
    let statements = seq(str("STATEMENTS INTO"), new Reuse.Target());
    let levels = seq(str("LEVELS INTO"), new Reuse.Target());
    let structures = seq(str("STRUCTURES INTO"), new Reuse.Target());
    let include = seq(str("INCLUDE INTO"), new Reuse.Target());
    let enh = seq(str("ENHANCEMENTS INTO"), new Reuse.Target());
    let enhO = seq(str("ENHANCEMENT OPTIONS INTO"), new Reuse.Target());
    let keywords = seq(str("KEYWORDS FROM"), new Reuse.Source());
    let pragmas = seq(str("WITH PRAGMAS"), new Reuse.Source());
    let overflow = seq(str("OVERFLOW INTO"), new Reuse.Target());
    let message = seq(str("MESSAGE INTO"), new Reuse.Target());
    let includeProgram = seq(str("INCLUDE PROGRAM FROM"), new Reuse.Source());
    let frame = seq(str("FRAME PROGRAM FROM"), new Reuse.Source());
    let program = seq(str("PROGRAM FROM"), new Reuse.Source());
    let from = seq(str("FROM"), new Reuse.Source());
    let to = seq(str("TO"), new Reuse.Source());
    let replacing = seq(str("REPLACING"), new Reuse.Source());
    let id = seq(str("ID"), new Reuse.Source(), str("TABLE"), new Reuse.Source());

    let ret = seq(str("SCAN ABAP-SOURCE"),
                  new Reuse.Source(),
                  per(tokens,
                      levels,
                      from,
                      to,
                      statements,
                      structures,
                      keywords,
                      word,
                      line,
                      overflow,
                      message,
                      includeProgram,
                      include,
                      frame,
                      enhO,
                      enh,
                      program,
                      replacing,
                      str("WITH ANALYSIS"),
                      str("WITH COMMENTS"),
                      str("WITH INCLUDES"),
                      str("WITHOUT TRMAC"),
                      str("WITH DECLARATIONS"),
                      str("WITH BLOCKS"),
                      str("WITH LIST TOKENIZATION"),
                      str("WITH EXPLICIT ENHANCEMENTS"),
                      str("WITH IMPLICIT ENHANCEMENTS"),
                      str("WITH INACTIVE ENHANCEMENTS"),
                      pragmas,
                      id));

    return ret;
  }

}