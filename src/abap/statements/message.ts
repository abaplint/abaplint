import {Statement} from "./_statement";
import {str, seq, opt, tok, per, regex as reg, alt, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens";
import {Target, Source, Field, MessageClass} from "../expressions";

export class Message extends Statement {

  public getMatcher(): IStatementRunnable {
    const like = seq(str("DISPLAY LIKE"), new Source());
    const into = seq(str("INTO"), new Target());

    const type = seq(str("TYPE"), new Source());
    const id = seq(str("ID"), new Source());
    const num = seq(str("NUMBER"), new Source());

    const mwith = seq(str("WITH"), new Source(), opt(new Source()), opt(new Source()), opt(new Source()));
    const raising = seq(str("RAISING"), new Field());
    const msgid = seq(tok(ParenLeft), new MessageClass(), tok(ParenRightW));
    const simple = seq(reg(/^\w\d\d\d$/), opt(msgid));

    const full = seq(id, type, num);
    const after = per(mwith, raising, alt(into, like));
    const options = seq(alt(full, simple), opt(after));
    const text = seq(new Source(), type, opt(like));

    const ret = seq(str("MESSAGE"), alt(options, text));

    return ret;
  }

}