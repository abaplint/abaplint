import {Statement} from "./statement";
import {str, seq, opt, tok, per, IRunnable} from "../combi";
import {ParenLeft} from "../tokens";
import {Target, Source, Field, MessageClass} from "../expressions";

export class Message extends Statement {

  public getMatcher(): IRunnable {
    let like = seq(str("DISPLAY LIKE"), new Source());
    let type = seq(str("TYPE"), new Source());
    let id = seq(str("ID"), new Source());
    let num = seq(str("NUMBER"), new Source());
    let into = seq(str("INTO"), new Target());
    let mwith = seq(str("WITH"), new Source(), opt(new Source()), opt(new Source()), opt(new Source()));
    let raising = seq(str("RAISING"), new Field());
    let msgid = seq(tok(ParenLeft), new MessageClass(), str(")"));
    let simple = seq(new Source(), opt(msgid), opt(mwith), opt(type));
    let full = seq(id, type, num);

    let options = per(full, mwith, into, raising, like, simple);

    let ret = seq(str("MESSAGE"), options);

    return ret;
  }

}