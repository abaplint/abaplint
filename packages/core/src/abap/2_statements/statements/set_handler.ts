import {IStatement} from "./_statement";
import {seqs, optPrios, altPrios, pluss} from "../combi";
import {Source, MethodSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetHandler implements IStatement {

  public getMatcher(): IStatementRunnable {
    const activation = seqs("ACTIVATION", Source);

    const fo = seqs("FOR", altPrios("ALL INSTANCES", Source));

    const ret = seqs("SET HANDLER",
                     pluss(MethodSource),
                     optPrios(fo),
                     optPrios(activation));

    return ret;
  }

}