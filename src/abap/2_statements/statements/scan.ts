import {IStatement} from "./_statement";
import {verNot, str, seq, per, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";

export class Scan implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tokens = seq(str("TOKENS INTO"), new Target());
    const word = seq(str("WORD INTO"), new Target());
    const line = seq(str("LINE INTO"), new Target());
    const statements = seq(str("STATEMENTS INTO"), new Target());
    const levels = seq(str("LEVELS INTO"), new Target());
    const structures = seq(str("STRUCTURES INTO"), new Target());
    const include = seq(str("INCLUDE INTO"), new Target());
    const offset = seq(str("OFFSET INTO"), new Target());
    const enh = seq(str("ENHANCEMENTS INTO"), new Target());
    const enhO = seq(str("ENHANCEMENT OPTIONS INTO"), new Target());
    const keywords = seq(str("KEYWORDS FROM"), new Source());
    const pragmas = seq(str("WITH PRAGMAS"), new Source());
    const overflow = seq(str("OVERFLOW INTO"), new Target());
    const message = seq(str("MESSAGE INTO"), new Target());
    const includeProgram = seq(str("INCLUDE PROGRAM FROM"), new Source());
    const frame = seq(str("FRAME PROGRAM FROM"), new Source());
    const program = seq(str("PROGRAM FROM"), new Source());
    const from = seq(str("FROM"), new Source());
    const to = seq(str("TO"), new Source());
    const replacing = seq(str("REPLACING"), new Source());
    const id = seq(str("ID"), new Source(), str("TABLE"), new Source());

    const ret = seq(str("SCAN ABAP-SOURCE"),
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
                        offset,
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
                        str("WITH TYPE-POOLS"),
                        str("WITH INCLUDES"),
                        str("WITHOUT TRMAC"),
                        str("WITH DECLARATIONS"),
                        str("WITH BLOCKS"),
                        str("PRESERVING IDENTIFIER ESCAPING"),
                        str("WITH LIST TOKENIZATION"),
                        str("WITH EXPLICIT ENHANCEMENTS"),
                        str("WITH IMPLICIT ENHANCEMENTS"),
                        str("WITH INACTIVE ENHANCEMENTS"),
                        pragmas,
                        id));

    return verNot(Version.Cloud, ret);
  }

}