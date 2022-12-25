import {IStatement} from "./_statement";
import {seq, altPrio, optPrio} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Clear implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seq("WITH", Source);

    const mode = altPrio("IN CHARACTER MODE", "IN BYTE MODE");

    return seq("CLEAR",
               Target,
               optPrio(wit),
               optPrio(mode));
  }

}