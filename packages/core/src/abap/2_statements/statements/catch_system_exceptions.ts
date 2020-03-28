import {IStatement} from "./_statement";
import {verNot, str, seq, plus} from "../combi";
import {Field, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CatchSystemExceptions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CATCH SYSTEM-EXCEPTIONS"),
                    plus(seq(new Field(), str("="), new Source())));

    return verNot(Version.Cloud, ret);
  }

}