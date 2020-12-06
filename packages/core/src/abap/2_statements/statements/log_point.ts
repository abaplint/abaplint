import {IStatement} from "./_statement";
import {verNot, seqs, opts, pluss} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LogPoint implements IStatement {

  public getMatcher(): IStatementRunnable {
    const subkey = seqs("SUBKEY", Source);

    const fields = seqs("FIELDS", pluss(Source));

    const ret = seqs("LOG-POINT ID",
                     NamespaceSimpleName,
                     opts(subkey),
                     opts(fields));

    return verNot(Version.Cloud, ret);
  }

}