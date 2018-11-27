import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class ConstantBegin extends Statement {

  public getMatcher(): IStatementRunnable {

    const ret = seq(str("CONSTANTS"), str("BEGIN"), str("OF"), new NamespaceSimpleName());

    return ret;
  }

}