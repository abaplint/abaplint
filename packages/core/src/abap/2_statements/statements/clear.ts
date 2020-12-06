import {IStatement} from "./_statement";
import {seq, opts, alts} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Clear implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seq("WITH", Source);

    const mode = alts("IN CHARACTER MODE",
                      "IN BYTE MODE");

    return seq("CLEAR",
               Target,
               opts(wit),
               opts(mode));
  }

}