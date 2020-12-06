import {IStatement} from "./_statement";
import {verNot, str, seqs, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Scan implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tokens = seqs("TOKENS INTO", Target);
    const word = seqs("WORD INTO", Target);
    const line = seqs("LINE INTO", Target);
    const statements = seqs("STATEMENTS INTO", Target);
    const levels = seqs("LEVELS INTO", Target);
    const structures = seqs("STRUCTURES INTO", Target);
    const include = seqs("INCLUDE INTO", Target);
    const offset = seqs("OFFSET INTO", Target);
    const enh = seqs("ENHANCEMENTS INTO", Target);
    const enhO = seqs("ENHANCEMENT OPTIONS INTO", Target);
    const keywords = seqs("KEYWORDS FROM", Source);
    const pragmas = seqs("WITH PRAGMAS", Source);
    const overflow = seqs("OVERFLOW INTO", Target);
    const message = seqs("MESSAGE INTO", Target);
    const includeProgram = seqs("INCLUDE PROGRAM FROM", Source);
    const frame = seqs("FRAME PROGRAM FROM", Source);
    const program = seqs("PROGRAM FROM", Source);
    const from = seqs("FROM", Source);
    const to = seqs("TO", Source);
    const replacing = seqs("REPLACING", Source);
    const id = seqs("ID", Source, "TABLE", Source);

    const ret = seqs("SCAN ABAP-SOURCE",
                     Source,
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