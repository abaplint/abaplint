import {IStatement} from "./_statement";
import {seq, opt, alt, per, optPrio, altPrio, ver, verNot} from "../combi";
import {Target, Source, ExceptionName, MessageSource, SimpleSource3} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Message implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = alt(ver(Version.v740sp02, Source), SimpleSource3);
    const like = seq("DISPLAY LIKE", Source);
    const into = seq("INTO", Target);
    const raising = seq("RAISING", ExceptionName);

    const options = per(like, into, raising);

    const type = seq("TYPE", Source);

    const sou = altPrio(options, s);
    const sourc = alt(sou,
                      seq(s, sou),
                      seq(s, s, sou),
                      seq(s, s, s, options));

    const mwith = seq("WITH", s, opt(sourc));

    const foo = seq(MessageSource, opt(options), opt(mwith));
    const text = seq(s, type, optPrio(like), optPrio(raising));

    const cloud = seq(MessageSource, opt(seq("WITH", Source, opt(Source), opt(Source), opt(Source))), altPrio(into, raising));

    const ret = seq("MESSAGE", altPrio(verNot(Version.Cloud, foo), verNot(Version.Cloud, text), ver(Version.Cloud, cloud)));

    return ret;
  }

}