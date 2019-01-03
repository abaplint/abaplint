import {Statement} from "./_statement";
import {str, seq, opt, tok, regex as reg, alt, IStatementRunnable, per, altPrio} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens";
import {Target, Source, Field, MessageClass} from "../expressions";

export class Message extends Statement {

  public getMatcher(): IStatementRunnable {
    const like = seq(str("DISPLAY LIKE"), new Source());
    const into = seq(str("INTO"), new Target());
//    const li = alt(like, into);
    const raising = seq(str("RAISING"), new Field());

    const options = per(like, into, raising);

    const type = seq(str("TYPE"), new Source());
    const id = seq(str("ID"), new Source());
    const num = seq(str("NUMBER"), new Source());

    const sou = altPrio(options, new Source());
    const sourc = alt(sou,
                      seq(new Source(), sou),
                      seq(new Source(), new Source(), sou),
                      seq(new Source(), new Source(), new Source(), options));

    const mwith = seq(str("WITH"), new Source(), opt(sourc));
    const msgid = seq(tok(ParenLeft), new MessageClass(), tok(ParenRightW));
    const simple = seq(reg(/^\w\d\d\d$/), opt(msgid));

    const full = seq(id, type, num);
    const foo = seq(alt(full, simple), opt(options), opt(mwith));
    const text = seq(new Source(), type, opt(like));

    const ret = seq(str("MESSAGE"), alt(foo, text));

    return ret;
  }

}