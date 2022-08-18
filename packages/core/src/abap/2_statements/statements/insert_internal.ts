import {IStatement} from "./_statement";
import {str, seq, opt, per, ver, altPrio, alt, optPrio} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Source, Dynamic, SimpleSource4} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InsertInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = altPrio(Source, Dynamic);
    const assigning = seq("ASSIGNING", FSTarget);
    const ref = seq("REFERENCE INTO", Target);
    const index = seq("INDEX", Source);
    const initial = str("INITIAL LINE");
    const into = seq("INTO", Target);
    const intoTable = seq("INTO TABLE", Target, opt(alt(ref, assigning)));

    const to = seq("TO", Source);
    const from = seq("FROM", Source);
    const fromTo = seq(optPrio(from), optPrio(to));

    const foo = alt(intoTable,
                    seq(into, opt(per(index, alt(ref, assigning)))),
                    per(index, alt(ref, assigning)));

    const lines = seq("LINES OF",
                      target,
                      opt(fromTo));

    const src = alt(SimpleSource4, ver(Version.v740sp02, Source));

    const tab = seq("TABLE", Source);

    const ret = seq("INSERT",
                    altPrio(tab, seq(altPrio(initial, lines, src), foo)));

    return ret;
  }

}