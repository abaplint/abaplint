import {IStatement} from "./_statement";
import {str, seq, alt, opt, per, ver, plus, altPrio} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Source, Dynamic, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

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

    const lines = seq(str("LINES OF"),
                      target,
                      opt(from));

    const src = alt(ver(Version.v740sp02, plus(new Source())), plus(new SimpleSource()));

    const tab = seq(str("TABLE"), new Source());

    const ret = seq(str("INSERT"),
                    alt(tab, seq(altPrio(initial, lines, src), foo)));

    return ret;
  }

}