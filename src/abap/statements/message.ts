import {Statement} from "./_statement";
import {str, seq, opt, tok, per, IRunnable} from "../combi";
import {ParenLeft} from "../tokens";
import {Target, Source, Field, MessageClass} from "../expressions";

export class Message extends Statement {

  public getMatcher(): IRunnable {
    const like = seq(str("DISPLAY LIKE"), new Source());
    const type = seq(str("TYPE"), new Source());
    const id = seq(str("ID"), new Source());
    const num = seq(str("NUMBER"), new Source());
    const into = seq(str("INTO"), new Target());
    const mwith = seq(str("WITH"), new Source(), opt(new Source()), opt(new Source()), opt(new Source()));
    const raising = seq(str("RAISING"), new Field());
    const msgid = seq(tok(ParenLeft), new MessageClass(), str(")"));
    const simple = seq(new Source(), opt(msgid), opt(mwith), opt(type));
    const full = seq(id, type, num);

    const options = per(full, mwith, into, raising, like, simple);

    const ret = seq(str("MESSAGE"), options);

    return ret;
  }

}