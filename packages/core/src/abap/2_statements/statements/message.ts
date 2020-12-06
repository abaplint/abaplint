import {IStatement} from "./_statement";
import {seq, opts, alt, pers, optPrios, altPrios, vers} from "../combi";
import {Target, Source, ExceptionName, MessageSource, ConstantOrFieldSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Message implements IStatement {

  public getMatcher(): IStatementRunnable {
    const like = seq("DISPLAY LIKE", Source);
    const into = seq("INTO", Target);
    const raising = seq("RAISING", ExceptionName);

    const options = pers(like, into, raising);

    const type = seq("TYPE", Source);

    const sou = altPrios(options, Source);
    const sourc = alt(sou,
                      seq(Source, sou),
                      seq(Source, Source, sou),
                      seq(Source, Source, Source, options));

    const mwith = seq("WITH", Source, opts(sourc));

    const foo = seq(MessageSource, opts(options), opts(mwith));
    const s = alt(vers(Version.v740sp02, Source), ConstantOrFieldSource);
    const text = seq(s, type, optPrios(like), optPrios(raising));

    const ret = seq("MESSAGE", altPrios(foo, text));

    return ret;
  }

}