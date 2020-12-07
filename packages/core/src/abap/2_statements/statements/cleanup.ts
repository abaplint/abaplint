import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Cleanup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq("INTO", Target);

    return seq("CLEANUP", opt(into));
  }

}