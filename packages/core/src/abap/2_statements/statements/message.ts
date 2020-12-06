import {IStatement} from "./_statement";
import {seqs, opt, alt, per, optPrio, altPrio, ver} from "../combi";
import {Target, Source, ExceptionName, MessageSource, ConstantOrFieldSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Message implements IStatement {

  public getMatcher(): IStatementRunnable {
    const like = seqs("DISPLAY LIKE", Source);
    const into = seqs("INTO", Target);
    const raising = seqs("RAISING", ExceptionName);

    const options = per(like, into, raising);

    const type = seqs("TYPE", Source);

    const sou = altPrio(options, new Source());
    const sourc = alt(sou,
                      seqs(Source, sou),
                      seqs(Source, Source, sou),
                      seqs(Source, Source, Source, options));

    const mwith = seqs("WITH", Source, opt(sourc));

    const foo = seqs(MessageSource, opt(options), opt(mwith));
    const s = alt(ver(Version.v740sp02, new Source()), new ConstantOrFieldSource());
    const text = seqs(s, type, optPrio(like), optPrio(raising));

    const ret = seqs("MESSAGE", altPrio(foo, text));

    return ret;
  }

}