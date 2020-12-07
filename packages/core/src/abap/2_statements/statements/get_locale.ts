import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetLocale implements IStatement {

  public getMatcher(): IStatementRunnable {
    const country = seq("COUNTRY", Target);

    const modifier = seq("MODIFIER", Target);

    const ret = seq("GET LOCALE LANGUAGE",
                    Target,
                    country,
                    opt(modifier));

    return verNot(Version.Cloud, ret);
  }

}