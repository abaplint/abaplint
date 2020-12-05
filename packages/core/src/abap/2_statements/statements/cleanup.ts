import {IStatement} from "./_statement";
import {seqs, opt} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Cleanup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seqs("INTO", Target);

    return seqs("CLEANUP", opt(into));
  }

}