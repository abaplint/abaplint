import {IStatement} from "./_statement";
import {seqs, alts, ver, pluss} from "../combi";
import {Version} from "../../../version";
import {Target, Source, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InsertFieldGroup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seqs("INTO", Target);

    const src = alts(ver(Version.v740sp02, pluss(Source)), pluss(SimpleSource));

    const ret = seqs("INSERT", src, into);

    return ret;
  }

}