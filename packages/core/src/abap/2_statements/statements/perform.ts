import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, alts, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {PerformTables, PerformUsing, PerformChanging} from "../expressions";

export class Perform implements IStatement {

  public getMatcher(): IStatementRunnable {
    const level = seqs("LEVEL", Expressions.Source);
    const commit = alts(seqs("ON COMMIT", opts(level)),
                        "ON ROLLBACK");

    const short = verNot(Version.Cloud, seqs(Expressions.FormName,
                                             tok(ParenLeft),
                                             Expressions.IncludeName,
                                             tok(ParenRightW)));

    const program = seqs("IN PROGRAM", opts(alts(Expressions.Dynamic, Expressions.IncludeName)));

    const found = str("IF FOUND");

    const full = seqs(alts(Expressions.FormName, Expressions.Dynamic),
                      opts(verNot(Version.Cloud, program)));

    const ret = seqs("PERFORM",
                     alts(short, full),
                     opts(found),
                     opts(PerformTables),
                     opts(PerformUsing),
                     opts(PerformChanging),
                     opts(found),
                     opts(commit));

    return ret;
  }

}