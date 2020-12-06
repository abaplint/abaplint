import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetLocale implements IStatement {

  public getMatcher(): IStatementRunnable {
    const country = seqs("COUNTRY", Source);

    const modifier = seqs("MODIFIER", Source);

    const ret = seqs("SET LOCALE LANGUAGE",
                     Source,
                     opts(country),
                     opts(modifier));

    return verNot(Version.Cloud, ret);
  }

}