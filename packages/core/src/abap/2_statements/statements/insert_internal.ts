import {IStatement} from "./_statement";
import {str, seq, alts, opts, pers, vers, altPrios} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Source, Dynamic, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InsertInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alts(Source, Dynamic);
    const assigning = seq("ASSIGNING", FSTarget);
    const ref = seq("REFERENCE INTO", Target);
    const index = seq("INDEX", Source);
    const initial = str("INITIAL LINE");
    const into = seq("INTO", opts("TABLE"), Target);

    const to = seq("TO", Source);

    const from = seq("FROM",
                     Source,
                     opts(to));

    const foo = pers(into, ref, index, assigning);

    const lines = seq("LINES OF",
                      target,
                      opts(from));

    const src = alts(vers(Version.v740sp02, Source), SimpleSource);

    const tab = seq("TABLE", Source);

    const ret = seq("INSERT",
                    altPrios(tab, seq(altPrios(initial, lines, src), foo)));

    return ret;
  }

}