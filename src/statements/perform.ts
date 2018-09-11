import {Statement} from "./statement";
import {str, seq, opt, alt, tok, per, plus, IRunnable} from "../combi";
import {ParenLeft, ParenRightW, ParenRight} from "../tokens/";
import {Source, Field, Dynamic, FormName} from "../expressions";

export class Perform extends Statement {

  public static get_matcher(): IRunnable {
    let programName = new Field();
    let using = seq(str("USING"), plus(new Source()));
    let tables = seq(str("TABLES"), plus(new Source()));
    let changing = seq(str("CHANGING"), plus(new Source()));
    let level = seq(str("LEVEL"), new Source());
    let commit = alt(seq(str("ON COMMIT"), opt(level)),
                     str("ON ROLLBACK"));

    let short = seq(new FormName(),
                    tok(ParenLeft),
                    programName,
                    alt(tok(ParenRightW), tok(ParenRight)));

    let program = seq(str("IN PROGRAM"), opt(alt(new Dynamic(), programName)));

    let found = str("IF FOUND");

    let full = seq(alt(new FormName(), new Dynamic()),
                   opt(program));

    return seq(str("PERFORM"),
               per(alt(short, full), found),
               opt(tables),
               opt(using),
               opt(changing),
               opt(found),
               opt(commit));
  }

}