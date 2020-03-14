import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeBegin extends Statement {

  public getMatcher(): IStatementRunnable {

    const begin = seq(str("BEGIN OF"), new NamespaceSimpleName());

    const ret = seq(str("TYPES"), begin);

    return ret;
  }

}