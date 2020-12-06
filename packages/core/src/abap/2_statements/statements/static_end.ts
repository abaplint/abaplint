import {IStatement} from "./_statement";
import {seq, alts} from "../combi";
import {DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class StaticEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(alts("STATIC", "STATICS"),
                    "END OF",
                    DefinitionName);

    return ret;
  }

}