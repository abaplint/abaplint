import {IStatement} from "./_statement";
import {verNot, seq, pluss} from "../combi";
import {Field, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CatchSystemExceptions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CATCH SYSTEM-EXCEPTIONS",
                    pluss(seq(Field, "=", Source)));

    return verNot(Version.Cloud, ret);
  }

}