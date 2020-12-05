import {IStatement} from "./_statement";
import {verNot, seqs, plus} from "../combi";
import {Field, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CatchSystemExceptions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("CATCH SYSTEM-EXCEPTIONS",
                     plus(seqs(Field, "=", Source)));

    return verNot(Version.Cloud, ret);
  }

}