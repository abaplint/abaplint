import {IStatement} from "./_statement";
import {verNot, seq, alts, opts} from "../combi";
import {FormName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Module implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("MODULE",
                    FormName,
                    opts(alts("INPUT", "OUTPUT")));

    return verNot(Version.Cloud, ret);
  }

}