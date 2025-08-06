import {IStatement} from "./_statement";
import {seq, opt, alt, per, optPrio, altPrio, ver, verNot} from "../combi";
import {Target, Source, ExceptionName, MessageSource, MessageSourceSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Message implements IStatement {

  public getMatcher(): IStatementRunnable {
    const like = seq("DISPLAY LIKE", Source);
    const into = seq("INTO", Target);
    const raising = seq("RAISING", ExceptionName);

    const options = per(like, into, raising);

    const type = seq("TYPE", Source);

    const sou = altPrio(options, MessageSourceSource);
    const sourc = alt(sou,
                      seq(MessageSourceSource, sou),
                      seq(MessageSourceSource, MessageSourceSource, sou),
                      seq(MessageSourceSource, MessageSourceSource, MessageSourceSource, options));

    const mwith = seq("WITH", MessageSourceSource, opt(sourc));

    const foo = seq(MessageSource, opt(options), opt(mwith));
    const text = seq(MessageSourceSource, type, optPrio(like), optPrio(raising));

    const cloud1 = seq(opt(seq("WITH", Source, opt(Source), opt(Source), opt(Source))), altPrio(into, raising));
    const cloud2 = seq(altPrio(into, raising), opt(seq("WITH", Source, opt(Source), opt(Source), opt(Source))));
    const cloud = seq(MessageSource, alt(cloud1, cloud2));

    const ret = seq("MESSAGE", altPrio(verNot(Version.Cloud, foo), verNot(Version.Cloud, text), ver(Version.Cloud, cloud)));

    return ret;
  }

}