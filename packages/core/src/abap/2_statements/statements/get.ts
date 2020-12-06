import {IStatement} from "./_statement";
import {verNot, seqs, pers, opts, pluss} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Get implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seqs("FIELDS", pluss(Field));

    const options = pers("LATE", fields);

    const ret = seqs("GET",
                     Target,
                     opts(options));

    return verNot(Version.Cloud, ret);
  }

}