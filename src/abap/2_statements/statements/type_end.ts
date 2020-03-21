import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeEnd extends Statement {

  public getMatcher(): IStatementRunnable {
    const end = seq(str("END OF"), new NamespaceSimpleName());

    const ret = seq(str("TYPES"), end);

    return ret;
  }

}