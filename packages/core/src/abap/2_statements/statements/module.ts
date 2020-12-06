import {IStatement} from "./_statement";
import {verNot, seq, alt, opt} from "../combi";
import {FormName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Module implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("MODULE",
                    FormName,
                    opt(alt("INPUT", "OUTPUT")));

    return verNot(Version.Cloud, ret);
  }

}