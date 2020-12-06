import {IStatement} from "./_statement";
import {verNot, str, seq, opts, alts} from "../combi";
import {Field, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Break implements IStatement {

  public getMatcher(): IStatementRunnable {
    const next = str("AT NEXT APPLICATION STATEMENT");

    const ret = alts(seq("BREAK-POINT", opts(alts(next, Source))),
                     seq("BREAK", Field));

    return verNot(Version.Cloud, ret);
  }

}