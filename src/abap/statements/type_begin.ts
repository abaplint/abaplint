import {Statement} from "./_statement";
import {str, seq, alt, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeBegin extends Statement {

  public getMatcher(): IStatementRunnable {

    const begin = seq(str("BEGIN OF"), new NamespaceSimpleName());

    const ret = seq(alt(str("TYPE"), str("TYPES")), begin);

    return ret;
  }

}