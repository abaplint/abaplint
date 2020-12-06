import {IStatement} from "./_statement";
import {verNot, seq, alt, per, plus, optPrio} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SyntaxCheck implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seq("PROGRAM", Source);
    const offset = seq("OFFSET", Target);
    const frame = seq("FRAME ENTRY", Target);
    const include = seq("INCLUDE", Target);
    const trace = seq("TRACE-TABLE", Target);
    const line = seq("LINE", Target);
    const word = seq("WORD", Target);
    const messageId = seq("MESSAGE-ID", Target);
    const message = seq("MESSAGE", Target);
    const id = seq("ID", Source, "TABLE", Target);
    const replacing = seq("REPLACING", Target);
    const directory = seq("DIRECTORY ENTRY", Source);
    const dump = seq("SHORTDUMP-ID", Source);
    const filter = seq("FILTER", Source);

    const syntax = seq(optPrio("PROGRAM"),
                       Source,
                       per(message,
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

    const dynpro = seq("DYNPRO",
                       Source,
                       Source,
                       Source,
                       Source,
                       per(message, line, word, offset, messageId, trace));

    const ret = seq("SYNTAX-CHECK FOR", alt(syntax, dynpro));

    return verNot(Version.Cloud, ret);
  }

}