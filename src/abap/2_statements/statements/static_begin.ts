import {IStatement} from "./_statement";
import {str, seq, alt, opt, IStatementRunnable} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";

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