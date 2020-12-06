import {IStatement} from "./_statement";
import {str, seqs, optPrio, altPrio, plus} from "../combi";
import {Source, MethodSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetHandler implements IStatement {

  public getMatcher(): IStatementRunnable {
    const activation = seqs("ACTIVATION", Source);

    const fo = seqs("FOR", altPrio(str("ALL INSTANCES"), new Source()));

    const ret = seqs("SET HANDLER",
                     plus(new MethodSource()),
                     optPrio(fo),
                     optPrio(activation));

    return ret;
  }

}