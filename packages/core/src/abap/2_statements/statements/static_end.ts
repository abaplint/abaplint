import {IStatement} from "./_statement";
import {seq, alt} from "../combi";
import {DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class StaticEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(alt("STATIC", "STATICS"),
                    "END OF",
                    DefinitionName);

    return ret;
  }

}