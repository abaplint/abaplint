import {IStatement} from "./_statement";
import {seq, optPrios, altPrio, pluss} from "../combi";
import {Source, MethodSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetHandler implements IStatement {

  public getMatcher(): IStatementRunnable {
    const activation = seq("ACTIVATION", Source);

    const fo = seq("FOR", altPrio("ALL INSTANCES", Source));

    const ret = seq("SET HANDLER",
                    pluss(MethodSource),
                    optPrios(fo),
                    optPrios(activation));

    return ret;
  }

}