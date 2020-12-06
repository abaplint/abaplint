import {IStatement} from "./_statement";
import {str, seqs, opt, alt, per, plus} from "../combi";
import {FSTarget, Target, Source, Dynamic, ComponentCond, FieldSub, SimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seqs("INDEX", Source);
    const from = seqs("FROM", Source);
    const transporting = seqs("TRANSPORTING",
                              plus(alt(new FieldSub(), new Dynamic())));

    const where = seqs("WHERE", ComponentCond);
    const assigning = seqs("ASSIGNING", FSTarget);
    const using = seqs("USING KEY", SimpleName);
    const additions = per(where, assigning, using);

    const target = alt(new Target(), new Dynamic());

    const options = alt(
      per(index, transporting),
      seqs(from, opt(per(index, transporting))),
      seqs(per(index, transporting), from, opt(per(index, transporting))));

    const long = seqs("MODIFY", opt(str("TABLE")), target, opt(options), opt(additions));

    const simple = seqs("MODIFY TABLE", target, from, opt(using));

    return alt(long, simple);
  }

}