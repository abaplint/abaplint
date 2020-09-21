import {IStatement} from "./_statement";
import {str, seq, opt, alt, per, altPrio, ver} from "../combi";
import {Target, Source, ExceptionName, MessageSource, ConstantOrFieldSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Message implements IStatement {

  public getMatcher(): IStatementRunnable {
    const like = seq(str("DISPLAY LIKE"), new Source());
    const into = seq(str("INTO"), new Target());
    const raising = seq(str("RAISING"), new ExceptionName());

    const options = per(like, into, raising);

    const type = seq(str("TYPE"), new Source());

    const sou = altPrio(options, new Source());
    const sourc = alt(sou,
                      seq(new Source(), sou),
                      seq(new Source(), new Source(), sou),
                      seq(new Source(), new Source(), new Source(), options));

    const mwith = seq(str("WITH"), new Source(), opt(sourc));

    const foo = seq(new MessageSource(), opt(options), opt(mwith));
    const s = alt(ver(Version.v740sp02, new Source()), new ConstantOrFieldSource());
    const text = seq(s, type, opt(like), opt(raising));

    const ret = seq(str("MESSAGE"), alt(foo, text));

    return ret;
  }

}