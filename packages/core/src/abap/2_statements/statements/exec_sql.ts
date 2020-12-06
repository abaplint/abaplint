import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {SimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ExecSQL implements IStatement {

  public getMatcher(): IStatementRunnable {
    const performing = seq("PERFORMING", SimpleName);

    const ret = seq("EXEC SQL", opts(performing));

    return verNot(Version.Cloud, ret);
  }

}