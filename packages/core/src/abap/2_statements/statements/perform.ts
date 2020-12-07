import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {PerformTables, PerformUsing, PerformChanging} from "../expressions";

export class Perform implements IStatement {

  public getMatcher(): IStatementRunnable {
    const level = seq("LEVEL", Expressions.Source);
    const commit = alt(seq("ON COMMIT", opt(level)),
                       "ON ROLLBACK");

    const short = verNot(Version.Cloud, seq(Expressions.FormName,
                                            tok(ParenLeft),
                                            Expressions.IncludeName,
                                            tok(ParenRightW)));

    const program = seq("IN PROGRAM", opt(alt(Expressions.Dynamic, Expressions.IncludeName)));

    const found = str("IF FOUND");

    const full = seq(alt(Expressions.FormName, Expressions.Dynamic),
                     opt(verNot(Version.Cloud, program)));

    const ret = seq("PERFORM",
                    alt(short, full),
                    opt(found),
                    opt(PerformTables),
                    opt(PerformUsing),
                    opt(PerformChanging),
                    opt(found),
                    opt(commit));

    return ret;
  }

}