import {Statement} from "./_statement";
import {verNot, str, seq, opt, per, alt, IRunnable, tok} from "../combi";
import {Integer, MessageClass, NamespaceSimpleName, Field} from "../expressions";
import {Version} from "../../version";
import {ParenLeft, ParenRightW, ParenRight} from "../tokens";

export class Report extends Statement {

  public getMatcher(): IRunnable {
    const more = seq(tok(ParenLeft), new Integer(), alt(tok(ParenRightW), tok(ParenRight)));
    const heading = str("NO STANDARD PAGE HEADING");
    const size = seq(str("LINE-SIZE"), new Integer());
    const count = seq(str("LINE-COUNT"), new Integer(), opt(more));
    const message = seq(str("MESSAGE-ID"), new MessageClass());
    const database = seq(str("USING DATABASE"), new Field());

    const ret = seq(str("REPORT"),
                    opt(new NamespaceSimpleName()),
                    opt(per(heading, size, count, database, message)));

    return verNot(Version.Cloud, ret);
  }

}