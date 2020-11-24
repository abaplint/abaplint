import {IStatement} from "./_statement";
import {str, seq, optPrio, altPrio, plus} from "../combi";
import {Source, MethodSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetHandler implements IStatement {

  public getMatcher(): IStatementRunnable {
    const activation = seq(str("ACTIVATION"), new Source());

    const fo = seq(str("FOR"), altPrio(str("ALL INSTANCES"), new Source()));

    const ret = seq(str("SET HANDLER"),
                    plus(new MethodSource()),
                    optPrio(fo),
                    optPrio(activation));

    return ret;
  }

}