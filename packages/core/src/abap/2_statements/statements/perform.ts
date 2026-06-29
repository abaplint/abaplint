import {IStatement} from "./_statement";
import {verNotLang, str, seq, opt, alt, tok, plus, altPrio} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import * as Expressions from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {PerformTables, PerformUsing, PerformChanging} from "../expressions";

export class Perform implements IStatement {

  public getMatcher(): IStatementRunnable {
    const level = seq("LEVEL", Expressions.Source);
    const commit = alt(seq("ON COMMIT", opt(level)),
                       "ON ROLLBACK");

    const short = verNotLang(LanguageVersion.Cloud, seq(Expressions.FormName,
                                                        tok(ParenLeft),
                                                        Expressions.IncludeName,
                                                        tok(ParenRightW)));

    const program = seq("IN PROGRAM", opt(alt(Expressions.Dynamic, Expressions.IncludeName)));

    const found = str("IF FOUND");

    const full = seq(alt(Expressions.FormName, Expressions.Dynamic),
                     opt(verNotLang(LanguageVersion.Cloud, program)));

    const normal = seq(opt(found),
                       opt(PerformTables),
                       opt(PerformUsing),
                       opt(PerformChanging),
                       opt(found),
                       opt(commit));

    const of = seq("OF", plus(Expressions.FormName));

    const ret = seq("PERFORM",
                    alt(short, full),
                    altPrio(of, normal));

    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}
