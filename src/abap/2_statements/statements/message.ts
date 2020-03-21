import {Statement} from "./_statement";
import {str, seq, opt, alt, IStatementRunnable, per, altPrio} from "../combi";
import {Target, Source, Field, MessageSource} from "../expressions";

export class Message extends Statement {

  public getMatcher(): IStatementRunnable {
    const like = seq(str("DISPLAY LIKE"), new Source());
    const into = seq(str("INTO"), new Target());
//    const li = alt(like, into);  // todo, only this is allowed
    const raising = seq(str("RAISING"), new Field());

    const options = per(like, into, raising);

    const type = seq(str("TYPE"), new Source());

    const sou = altPrio(options, new Source());
    const sourc = alt(sou,
                      seq(new Source(), sou),
                      seq(new Source(), new Source(), sou),
                      seq(new Source(), new Source(), new Source(), options));

    const mwith = seq(str("WITH"), new Source(), opt(sourc));

    const foo = seq(new MessageSource(), opt(options), opt(mwith));
    const text = seq(new Source(), type, opt(like), opt(raising));

    const ret = seq(str("MESSAGE"), alt(foo, text));

    return ret;
  }

}