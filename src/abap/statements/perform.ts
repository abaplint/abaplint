import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, tok, per, plus, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW, ParenRight} from "../tokens/";
import {Source, Field, Dynamic, FormName} from "../expressions";
import {Version} from "../../version";

export class Perform extends Statement {

  public getMatcher(): IStatementRunnable {
    const programName = new Field();
    const using = seq(str("USING"), plus(new Source()));
    const tables = seq(str("TABLES"), plus(new Source()));
    const changing = seq(str("CHANGING"), plus(new Source()));
    const level = seq(str("LEVEL"), new Source());
    const commit = alt(seq(str("ON COMMIT"), opt(level)),
                       str("ON ROLLBACK"));

    const short = seq(new FormName(),
                      tok(ParenLeft),
                      programName,
                      alt(tok(ParenRightW), tok(ParenRight)));

    const program = seq(str("IN PROGRAM"), opt(alt(new Dynamic(), programName)));

    const found = str("IF FOUND");

    const full = seq(alt(new FormName(), new Dynamic()),
                     opt(program));

    const ret = seq(str("PERFORM"),
                    per(alt(short, full), found),
                    opt(tables),
                    opt(using),
                    opt(changing),
                    opt(found),
                    opt(commit));

    return verNot(Version.Cloud, ret);
  }

}