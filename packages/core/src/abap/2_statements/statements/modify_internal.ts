import {IStatement} from "./_statement";
import {seqs, opts, alts, pers, pluss} from "../combi";
import {FSTarget, Target, Source, Dynamic, ComponentCond, FieldSub, SimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seqs("INDEX", Source);
    const from = seqs("FROM", Source);
    const transporting = seqs("TRANSPORTING", pluss(alts(FieldSub, Dynamic)));

    const where = seqs("WHERE", ComponentCond);
    const assigning = seqs("ASSIGNING", FSTarget);
    const using = seqs("USING KEY", SimpleName);
    const additions = pers(where, assigning, using);

    const target = alts(Target, Dynamic);

    const options = alts(
      pers(index, transporting),
      seqs(from, opts(pers(index, transporting))),
      seqs(pers(index, transporting), from, opts(pers(index, transporting))));

    const long = seqs("MODIFY", opts("TABLE"), target, opts(options), opts(additions));

    const simple = seqs("MODIFY TABLE", target, from, opts(using));

    return alts(long, simple);
  }

}