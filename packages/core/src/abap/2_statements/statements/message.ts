import {IStatement} from "./_statement";
import {seq, opt, alt, per, optPrio, altPrio, vers} from "../combi";
import {Target, Source, ExceptionName, MessageSource, ConstantOrFieldSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Message implements IStatement {

  public getMatcher(): IStatementRunnable {
    const like = seq("DISPLAY LIKE", Source);
    const into = seq("INTO", Target);
    const raising = seq("RAISING", ExceptionName);

    const options = per(like, into, raising);

    const type = seq("TYPE", Source);

    const sou = altPrio(options, Source);
    const sourc = alt(sou,
                      seq(Source, sou),
                      seq(Source, Source, sou),
                      seq(Source, Source, Source, options));

    const mwith = seq("WITH", Source, opt(sourc));

    const foo = seq(MessageSource, opt(options), opt(mwith));
    const s = alt(vers(Version.v740sp02, Source), ConstantOrFieldSource);
    const text = seq(s, type, optPrio(like), optPrio(raising));

    const ret = seq("MESSAGE", altPrio(foo, text));

    return ret;
  }

}