import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const end = seq(str("END OF"), new NamespaceSimpleName());

    const ret = seq(str("TYPES"), end);

    return ret;
  }

}