import {IStatement} from "./_statement";
import {seq, alt, ver, plus} from "../combi";
import {Version} from "../../../version";
import {Target, Source, SimpleSource1} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InsertFieldGroup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq("INTO", Target);

    const src = alt(ver(Version.v740sp02, plus(Source)), plus(SimpleSource1));

    const ret = seq("INSERT", src, into);

    return ret;
  }

}