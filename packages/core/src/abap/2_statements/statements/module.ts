import {IStatement} from "./_statement";
import {verNot, seq, alt, opt} from "../combi";
import {FormName, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Module implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sw = seq("SWITCH", NamespaceSimpleName);

    const ret = seq("MODULE",
                    FormName,
                    opt(alt("INPUT", "OUTPUT", "ON CHAIN-REQUEST", "ON CHAIN-INPUT", "AT EXIT-COMMAND", sw)));

    return verNot(Version.Cloud, ret);
  }

}