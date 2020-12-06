import {IStatement} from "./_statement";
import {str, seqs, alt} from "../combi";
import {DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class StaticEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs(alt(str("STATIC"), str("STATICS")),
                     "END OF",
                     DefinitionName);

    return ret;
  }

}