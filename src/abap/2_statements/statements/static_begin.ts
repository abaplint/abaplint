import {IStatement} from "./_statement";
import {str, seq, alt, opt} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class StaticBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq(str("OCCURS"), new Integer());

    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    str("BEGIN OF"),
                    new NamespaceSimpleName(),
                    opt(occurs));

    return ret;
  }

}