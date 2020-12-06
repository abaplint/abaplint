import {IStatement} from "./_statement";
import {seqs, opts} from "../combi";
import {Target, Source, FSTarget} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Collect implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seqs("INTO", Target);
    const assigning = seqs("ASSIGNING", FSTarget);

    return seqs("COLLECT",
                Source,
                opts(into),
                opts(assigning));
  }

}