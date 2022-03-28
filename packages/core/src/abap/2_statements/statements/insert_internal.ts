import {IStatement} from "./_statement";
import {str, seq, alt, opt, per, ver, altPrio} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Source, Dynamic, SimpleSource1} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InsertInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alt(Source, Dynamic);
    const assigning = seq("ASSIGNING", FSTarget);
    const ref = seq("REFERENCE INTO", Target);
    const index = seq("INDEX", Source);
    const initial = str("INITIAL LINE");
    const into = seq("INTO", opt("TABLE"), Target);

    const to = seq("TO", Source);
    const from = seq("FROM", Source);
    const fromTo = seq(opt(from), opt(to));

    const foo = per(into, ref, index, assigning);

    const lines = seq("LINES OF",
                      target,
                      opt(fromTo));

    const src = alt(ver(Version.v740sp02, Source), SimpleSource1);

    const tab = seq("TABLE", Source);

    const ret = seq("INSERT",
                    altPrio(tab, seq(altPrio(initial, lines, src), foo)));

    return ret;
  }

}