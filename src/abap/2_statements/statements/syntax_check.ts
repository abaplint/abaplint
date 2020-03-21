import {IStatement} from "./_statement";
import {verNot, str, seq, alt, per, plus, IStatementRunnable, optPrio} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";

export class SyntaxCheck implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seq(str("PROGRAM"), new Source());
    const offset = seq(str("OFFSET"), new Target());
    const frame = seq(str("FRAME ENTRY"), new Target());
    const include = seq(str("INCLUDE"), new Target());
    const trace = seq(str("TRACE-TABLE"), new Target());
    const line = seq(str("LINE"), new Target());
    const word = seq(str("WORD"), new Target());
    const messageId = seq(str("MESSAGE-ID"), new Target());
    const message = seq(str("MESSAGE"), new Target());
    const id = seq(str("ID"), new Source(), str("TABLE"), new Target());
    const replacing = seq(str("REPLACING"), new Target());
    const directory = seq(str("DIRECTORY ENTRY"), new Source());
    const dump = seq(str("SHORTDUMP-ID"), new Source());
    const filter = seq(str("FILTER"), new Source());

    const syntax = seq(optPrio(str("PROGRAM")),
                       new Source(),
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

    const dynpro = seq(str("DYNPRO"),
                       new Source(),
                       new Source(),
                       new Source(),
                       new Source(),
                       per(message, line, word, offset, messageId, trace));

    const ret = seq(str("SYNTAX-CHECK FOR"), alt(syntax, dynpro));

    return verNot(Version.Cloud, ret);
  }

}