import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, alt} from "../combi";
import {Field, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Break implements IStatement {

  public getMatcher(): IStatementRunnable {
    const next = str("AT NEXT APPLICATION STATEMENT");
    const log = new Source();

    const ret = alt(seqs("BREAK-POINT", opt(alt(next, log))),
                    seqs("BREAK", Field));

    return verNot(Version.Cloud, ret);
  }

}