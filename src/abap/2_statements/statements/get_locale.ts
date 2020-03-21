import {IStatement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";

export class GetLocale implements IStatement {

  public getMatcher(): IStatementRunnable {
    const country = seq(str("COUNTRY"), new Target());

    const modifier = seq(str("MODIFIER"), new Target());

    const ret = seq(str("GET LOCALE LANGUAGE"),
                    new Target(),
                    country,
                    opt(modifier));

    return verNot(Version.Cloud, ret);
  }

}