import {IStatement} from "./_statement";
import {seqs, opts, alts, per, optPrios, altPrios, ver} from "../combi";
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

    const sou = altPrios(options, Source);
    const sourc = alts(sou,
                       seqs(Source, sou),
                       seqs(Source, Source, sou),
                       seqs(Source, Source, Source, options));

    const mwith = seqs("WITH", Source, opts(sourc));

    const foo = seqs(MessageSource, opts(options), opts(mwith));
    const s = alts(ver(Version.v740sp02, new Source()), ConstantOrFieldSource);
    const text = seqs(s, type, optPrios(like), optPrios(raising));

    const ret = seqs("MESSAGE", altPrios(foo, text));

    return ret;
  }

}