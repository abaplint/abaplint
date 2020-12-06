import {IStatement} from "./_statement";
import {verNot, seqs, opt, plus} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LogPoint implements IStatement {

  public getMatcher(): IStatementRunnable {
    const subkey = seqs("SUBKEY", Source);

    const fields = seqs("FIELDS", plus(new Source()));

    const ret = seqs("LOG-POINT ID",
                     NamespaceSimpleName,
                     opt(subkey),
                     opt(fields));

    return verNot(Version.Cloud, ret);
  }

}