import {Statement} from "./_statement";
import {str, seq, alt, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class StaticEnd extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    str("END OF"),
                    new NamespaceSimpleName());

    return ret;
  }

}