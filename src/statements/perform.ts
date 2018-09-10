import {Statement} from "./statement";
import {str, seq, opt, alt, tok, per, plus, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft, ParenRightW, ParenRight} from "../tokens/";

export class Perform extends Statement {

  public static get_matcher(): IRunnable {
    let programName = new Reuse.Field();
    let using = seq(str("USING"), plus(new Reuse.Source()));
    let tables = seq(str("TABLES"), plus(new Reuse.Source()));
    let changing = seq(str("CHANGING"), plus(new Reuse.Source()));
    let level = seq(str("LEVEL"), new Reuse.Source());
    let commit = alt(seq(str("ON COMMIT"), opt(level)),
                     str("ON ROLLBACK"));

    let short = seq(new Reuse.FormName(),
                    tok(ParenLeft),
                    programName,
                    alt(tok(ParenRightW), tok(ParenRight)));

    let program = seq(str("IN PROGRAM"), opt(alt(new Reuse.Dynamic(), programName)));

    let found = str("IF FOUND");

    let full = seq(alt(new Reuse.FormName(), new Reuse.Dynamic()),
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