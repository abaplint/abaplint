import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, alts} from "../combi";
import {Field, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Break implements IStatement {

  public getMatcher(): IStatementRunnable {
    const next = str("AT NEXT APPLICATION STATEMENT");
    const log = new Source();

    const ret = alts(seqs("BREAK-POINT", opt(alts(next, log))),
                     seqs("BREAK", Field));

    return verNot(Version.Cloud, ret);
  }

}