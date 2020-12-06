import {IStatement} from "./_statement";
import {str, seqs, alt, opt, per, ver, altPrio} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Source, Dynamic, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InsertInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alt(new Source(), new Dynamic());
    const assigning = seqs("ASSIGNING", FSTarget);
    const ref = seqs("REFERENCE INTO", Target);
    const index = seqs("INDEX", Source);
    const initial = str("INITIAL LINE");
    const into = seqs("INTO", opt(str("TABLE")), Target);

    const to = seqs("TO", Source);

    const from = seqs("FROM",
                      Source,
                      opt(to));

    const foo = per(into,
                    ref,
                    index,
                    assigning);

    const lines = seqs("LINES OF",
                       target,
                       opt(from));

    const src = alt(ver(Version.v740sp02, new Source()), new SimpleSource());

    const tab = seqs("TABLE", Source);

    const ret = seqs("INSERT",
                     altPrio(tab, seqs(altPrio(initial, lines, src), foo)));

    return ret;
  }

}