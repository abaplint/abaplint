import {IStatement} from "./_statement";
import {seqs, opts, alts, per, plus} from "../combi";
import {FSTarget, Target, Source, Dynamic, ComponentCond, FieldSub, SimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seqs("INDEX", Source);
    const from = seqs("FROM", Source);
    const transporting = seqs("TRANSPORTING",
                              plus(alts(FieldSub, Dynamic)));

    const where = seqs("WHERE", ComponentCond);
    const assigning = seqs("ASSIGNING", FSTarget);
    const using = seqs("USING KEY", SimpleName);
    const additions = per(where, assigning, using);

    const target = alts(Target, Dynamic);

    const options = alts(
      per(index, transporting),
      seqs(from, opts(per(index, transporting))),
      seqs(per(index, transporting), from, opts(per(index, transporting))));

    const long = seqs("MODIFY", opts("TABLE"), target, opts(options), opts(additions));

    const simple = seqs("MODIFY TABLE", target, from, opts(using));

    return alts(long, simple);
  }

}