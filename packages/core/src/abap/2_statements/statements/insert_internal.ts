import {IStatement} from "./_statement";
import {str, seqs, alts, opts, pers, vers, altPrios} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Source, Dynamic, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InsertInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alts(Source, Dynamic);
    const assigning = seqs("ASSIGNING", FSTarget);
    const ref = seqs("REFERENCE INTO", Target);
    const index = seqs("INDEX", Source);
    const initial = str("INITIAL LINE");
    const into = seqs("INTO", opts("TABLE"), Target);

    const to = seqs("TO", Source);

    const from = seqs("FROM",
                      Source,
                      opts(to));

    const foo = pers(into, ref, index, assigning);

    const lines = seqs("LINES OF",
                       target,
                       opts(from));

    const src = alts(vers(Version.v740sp02, Source), SimpleSource);

    const tab = seqs("TABLE", Source);

    const ret = seqs("INSERT",
                     altPrios(tab, seqs(altPrios(initial, lines, src), foo)));

    return ret;
  }

}