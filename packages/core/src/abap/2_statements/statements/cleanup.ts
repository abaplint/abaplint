import {IStatement} from "./_statement";
import {seqs, opts} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Cleanup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seqs("INTO", Target);

    return seqs("CLEANUP", opts(into));
  }

}