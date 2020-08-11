import {IStatement} from "./_statement";
import {str, seq, alt, ver, plus} from "../combi";
import {Version} from "../../../version";
import {Target, Source, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InsertFieldGroup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq(str("INTO"), new Target());

    const src = alt(ver(Version.v740sp02, plus(new Source())), plus(new SimpleSource()));

    const ret = seq(str("INSERT"), src, into);

    return ret;
  }

}