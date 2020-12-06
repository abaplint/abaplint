import {IStatement} from "./_statement";
import {verNot, seq, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Scan implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tokens = seq("TOKENS INTO", Target);
    const word = seq("WORD INTO", Target);
    const line = seq("LINE INTO", Target);
    const statements = seq("STATEMENTS INTO", Target);
    const levels = seq("LEVELS INTO", Target);
    const structures = seq("STRUCTURES INTO", Target);
    const include = seq("INCLUDE INTO", Target);
    const offset = seq("OFFSET INTO", Target);
    const enh = seq("ENHANCEMENTS INTO", Target);
    const enhO = seq("ENHANCEMENT OPTIONS INTO", Target);
    const keywords = seq("KEYWORDS FROM", Source);
    const pragmas = seq("WITH PRAGMAS", Source);
    const overflow = seq("OVERFLOW INTO", Target);
    const message = seq("MESSAGE INTO", Target);
    const includeProgram = seq("INCLUDE PROGRAM FROM", Source);
    const frame = seq("FRAME PROGRAM FROM", Source);
    const program = seq("PROGRAM FROM", Source);
    const from = seq("FROM", Source);
    const to = seq("TO", Source);
    const replacing = seq("REPLACING", Source);
    const id = seq("ID", Source, "TABLE", Source);

    const ret = seq("SCAN ABAP-SOURCE",
                    Source,
                    pers(tokens,
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
                         "WITH ANALYSIS",
                         "WITH COMMENTS",
                         "WITH TYPE-POOLS",
                         "WITH INCLUDES",
                         "WITHOUT TRMAC",
                         "WITH DECLARATIONS",
                         "WITH BLOCKS",
                         "PRESERVING IDENTIFIER ESCAPING",
                         "WITH LIST TOKENIZATION",
                         "WITH EXPLICIT ENHANCEMENTS",
                         "WITH IMPLICIT ENHANCEMENTS",
                         "WITH INACTIVE ENHANCEMENTS",
                         pragmas,
                         id));

    return verNot(Version.Cloud, ret);
  }

}