import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, alts, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {PerformTables, PerformUsing, PerformChanging} from "../expressions";

export class Perform implements IStatement {

  public getMatcher(): IStatementRunnable {
    const level = seqs("LEVEL", Expressions.Source);
    const commit = alts(seqs("ON COMMIT", opt(level)),
                        "ON ROLLBACK");

    const short = verNot(Version.Cloud, seqs(Expressions.FormName,
                                             tok(ParenLeft),
                                             Expressions.IncludeName,
                                             tok(ParenRightW)));

    const program = seqs("IN PROGRAM", opt(alts(Expressions.Dynamic, Expressions.IncludeName)));

    const found = str("IF FOUND");

    const full = seqs(alts(Expressions.FormName, Expressions.Dynamic),
                      opt(verNot(Version.Cloud, program)));

    const ret = seqs("PERFORM",
                     alts(short, full),
                     opt(found),
                     opt(new PerformTables()),
                     opt(new PerformUsing()),
                     opt(new PerformChanging()),
                     opt(found),
                     opt(commit));

    return ret;
  }

}