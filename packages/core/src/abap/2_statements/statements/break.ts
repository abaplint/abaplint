import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt} from "../combi";
import {FieldSub, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Break implements IStatement {

  public getMatcher(): IStatementRunnable {
    const next = str("AT NEXT APPLICATION STATEMENT");

    const ret = alt(seq("BREAK-POINT", opt(alt(next, Source))),
                    seq("BREAK", FieldSub));

    return verNot(Version.Cloud, ret);
  }

}