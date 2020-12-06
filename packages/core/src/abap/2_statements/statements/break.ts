import {IStatement} from "./_statement";
import {verNot, str, seq, opts, alt} from "../combi";
import {Field, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Break implements IStatement {

  public getMatcher(): IStatementRunnable {
    const next = str("AT NEXT APPLICATION STATEMENT");

    const ret = alt(seq("BREAK-POINT", opts(alt(next, Source))),
                    seq("BREAK", Field));

    return verNot(Version.Cloud, ret);
  }

}