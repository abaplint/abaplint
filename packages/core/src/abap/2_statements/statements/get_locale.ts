import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetLocale implements IStatement {

  public getMatcher(): IStatementRunnable {
    const country = seqs("COUNTRY", Target);

    const modifier = seqs("MODIFIER", Target);

    const ret = seqs("GET LOCALE LANGUAGE",
                     Target,
                     country,
                     opts(modifier));

    return verNot(Version.Cloud, ret);
  }

}