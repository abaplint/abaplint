import {IStatement} from "./_statement";
import {verNot, seq, opts, pluss} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LogPoint implements IStatement {

  public getMatcher(): IStatementRunnable {
    const subkey = seq("SUBKEY", Source);

    const fields = seq("FIELDS", pluss(Source));

    const ret = seq("LOG-POINT ID",
                    NamespaceSimpleName,
                    opts(subkey),
                    opts(fields));

    return verNot(Version.Cloud, ret);
  }

}