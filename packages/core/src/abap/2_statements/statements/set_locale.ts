import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetLocale implements IStatement {

  public getMatcher(): IStatementRunnable {
    const country = seq("COUNTRY", Source);

    const modifier = seq("MODIFIER", Source);

    const ret = seq("SET LOCALE LANGUAGE",
                    Source,
                    opts(country),
                    opts(modifier));

    return verNot(Version.Cloud, ret);
  }

}