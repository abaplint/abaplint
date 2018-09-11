import {Statement} from "./statement";
import {str, seq, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Scan extends Statement {

  public static get_matcher(): IRunnable {
    let tokens = seq(str("TOKENS INTO"), new Target());
    let word = seq(str("WORD INTO"), new Target());
    let line = seq(str("LINE INTO"), new Target());
    let statements = seq(str("STATEMENTS INTO"), new Target());
    let levels = seq(str("LEVELS INTO"), new Target());
    let structures = seq(str("STRUCTURES INTO"), new Target());
    let include = seq(str("INCLUDE INTO"), new Target());
    let enh = seq(str("ENHANCEMENTS INTO"), new Target());
    let enhO = seq(str("ENHANCEMENT OPTIONS INTO"), new Target());
    let keywords = seq(str("KEYWORDS FROM"), new Source());
    let pragmas = seq(str("WITH PRAGMAS"), new Source());
    let overflow = seq(str("OVERFLOW INTO"), new Target());
    let message = seq(str("MESSAGE INTO"), new Target());
    let includeProgram = seq(str("INCLUDE PROGRAM FROM"), new Source());
    let frame = seq(str("FRAME PROGRAM FROM"), new Source());
    let program = seq(str("PROGRAM FROM"), new Source());
    let from = seq(str("FROM"), new Source());
    let to = seq(str("TO"), new Source());
    let replacing = seq(str("REPLACING"), new Source());
    let id = seq(str("ID"), new Source(), str("TABLE"), new Source());

    let ret = seq(str("SCAN ABAP-SOURCE"),
                  new Source(),
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