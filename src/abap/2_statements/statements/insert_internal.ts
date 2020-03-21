import {IStatement} from "./_statement";
import {str, seq, alt, opt, per, ver, IStatementRunnable} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Source, Dynamic, SimpleSource} from "../expressions";

export class InsertInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alt(new Source(), new Dynamic());
    const assigning = seq(str("ASSIGNING"), new FSTarget());
    const ref = seq(str("REFERENCE INTO"), new Target());
    const index = seq(str("INDEX"), new Source());
    const initial = str("INITIAL LINE");
    const into = seq(str("INTO"), opt(str("TABLE")), new Target());

    const to = seq(str("TO"), new Source());

    const from = seq(str("FROM"),
                     new Source(),
                     opt(to));

    const foo = per(into,
                    ref,
                    index,
                    assigning);

    const lines = seq(opt(str("LINES OF")),
                      target,
                      opt(from));

    const src = alt(ver(Version.v740sp02, new Source()), new SimpleSource());

    const tab = seq(str("TABLE"), new Source());

    const ret = seq(str("INSERT"),
                    alt(tab, seq(alt(src, initial, lines), foo)));

    return ret;
  }

}