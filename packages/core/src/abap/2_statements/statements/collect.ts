import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {Target, Source, FSTarget} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Collect implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq("INTO", Target);
    const assigning = seq("ASSIGNING", FSTarget);

    return seq("COLLECT",
               Source,
               opt(into),
               opt(assigning));
  }

}