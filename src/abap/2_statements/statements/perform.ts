import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, tok, plus} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Perform implements IStatement {

  public getMatcher(): IStatementRunnable {
    const using = seq(str("USING"), plus(new Expressions.Source()));
    const tables = seq(str("TABLES"), plus(new Expressions.Source()));
    const changing = seq(str("CHANGING"), plus(new Expressions.Source()));
    const level = seq(str("LEVEL"), new Expressions.Source());
    const commit = alt(seq(str("ON COMMIT"), opt(level)),
                       str("ON ROLLBACK"));

    const short = verNot(Version.Cloud, seq(new Expressions.FormName(),
                                            tok(ParenLeft),
                                            new Expressions.IncludeName(),
                                            tok(ParenRightW)));

    const program = seq(str("IN PROGRAM"), opt(alt(new Expressions.Dynamic(), new Expressions.IncludeName())));

    const found = str("IF FOUND");

    const full = seq(alt(new Expressions.FormName(), new Expressions.Dynamic()),
                     opt(verNot(Version.Cloud, program)));

    const ret = seq(str("PERFORM"),
                    alt(short, full),
                    opt(found),
                    opt(tables),
                    opt(using),
                    opt(changing),
                    opt(found),
                    opt(commit));

    return ret;
  }

}