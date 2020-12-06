import {IStatement} from "./_statement";
import {verNot, seqs, alts, pers, plus, optPrios} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SyntaxCheck implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seqs("PROGRAM", Source);
    const offset = seqs("OFFSET", Target);
    const frame = seqs("FRAME ENTRY", Target);
    const include = seqs("INCLUDE", Target);
    const trace = seqs("TRACE-TABLE", Target);
    const line = seqs("LINE", Target);
    const word = seqs("WORD", Target);
    const messageId = seqs("MESSAGE-ID", Target);
    const message = seqs("MESSAGE", Target);
    const id = seqs("ID", Source, "TABLE", Target);
    const replacing = seqs("REPLACING", Target);
    const directory = seqs("DIRECTORY ENTRY", Source);
    const dump = seqs("SHORTDUMP-ID", Source);
    const filter = seqs("FILTER", Source);

    const syntax = seqs(optPrios("PROGRAM"),
                        Source,
                        pers(message,
                             line,
                             word,
                             offset,
                             program,
                             replacing,
                             directory,
                             frame,
                             include,
                             messageId,
                             trace,
                             dump,
                             filter,
                             plus(id)));

    const dynpro = seqs("DYNPRO",
                        Source,
                        Source,
                        Source,
                        Source,
                        pers(message, line, word, offset, messageId, trace));

    const ret = seqs("SYNTAX-CHECK FOR", alts(syntax, dynpro));

    return verNot(Version.Cloud, ret);
  }

}