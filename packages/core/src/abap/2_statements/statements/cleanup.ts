import {IStatement} from "./_statement";
import {seq, opts} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Cleanup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq("INTO", Target);

    return seq("CLEANUP", opts(into));
  }

}