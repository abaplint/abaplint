import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const end = seq(str("END OF"), new NamespaceSimpleName());

    const ret = seq(str("TYPES"), end);

    return ret;
  }

}