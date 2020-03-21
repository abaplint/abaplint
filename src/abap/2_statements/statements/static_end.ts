import {IStatement} from "./_statement";
import {str, seq, alt} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class StaticEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    str("END OF"),
                    new NamespaceSimpleName());

    return ret;
  }

}