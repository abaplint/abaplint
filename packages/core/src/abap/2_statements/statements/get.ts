import {IStatement} from "./_statement";
import {verNot, str, seqs, per, opt, plus} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Get implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seqs("FIELDS", plus(new Field()));

    const options = per(str("LATE"), fields);

    const ret = seqs("GET",
                     Target,
                     opt(options));

    return verNot(Version.Cloud, ret);
  }

}