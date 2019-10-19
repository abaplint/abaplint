import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, tok, plus, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens/";
import {Source, Dynamic, FormName, IncludeName} from "../expressions";
import {Version} from "../../version";

export class Perform extends Statement {

  public getMatcher(): IStatementRunnable {
    const using = seq(str("USING"), plus(new Source()));
    const tables = seq(str("TABLES"), plus(new Source()));
    const changing = seq(str("CHANGING"), plus(new Source()));
    const level = seq(str("LEVEL"), new Source());
    const commit = alt(seq(str("ON COMMIT"), opt(level)),
                       str("ON ROLLBACK"));

    const short = verNot(Version.Cloud, seq(new FormName(),
                                            tok(ParenLeft),
                                            new IncludeName(),
                                            tok(ParenRightW)));

    const program = seq(str("IN PROGRAM"), opt(alt(new Dynamic(), new IncludeName())));

    const found = str("IF FOUND");

    const full = seq(alt(new FormName(), new Dynamic()),
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