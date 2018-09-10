import {Statement} from "./statement";
import {str, seq, opt, tok, per, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft} from "../tokens";
import {Target} from "../expressions";

export class Message extends Statement {

  public static get_matcher(): IRunnable {
    let like = seq(str("DISPLAY LIKE"), new Reuse.Source());
    let type = seq(str("TYPE"), new Reuse.Source());
    let id = seq(str("ID"), new Reuse.Source());
    let num = seq(str("NUMBER"), new Reuse.Source());
    let into = seq(str("INTO"), new Target());
    let mwith = seq(str("WITH"), new Reuse.Source(), opt(new Reuse.Source()), opt(new Reuse.Source()), opt(new Reuse.Source()));
    let raising = seq(str("RAISING"), new Reuse.Field());
    let msgid = seq(tok(ParenLeft), new Reuse.MessageClass(), str(")"));
    let simple = seq(new Reuse.Source(), opt(msgid), opt(mwith), opt(type));
    let full = seq(id, type, num);

    let options = per(full, mwith, into, raising, like, simple);

    let ret = seq(str("MESSAGE"), options);

    return ret;
  }

}