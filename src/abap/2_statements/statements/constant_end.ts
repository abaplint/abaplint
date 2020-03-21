import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class ConstantEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CONSTANTS"), str("END"), str("OF"), new NamespaceSimpleName());

    return ret;
  }

}