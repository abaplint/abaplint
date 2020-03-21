import {IStatement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class SetLocale implements IStatement {

  public getMatcher(): IStatementRunnable {
    const country = seq(str("COUNTRY"), new Source());

    const modifier = seq(str("MODIFIER"), new Source());

    const ret = seq(str("SET LOCALE LANGUAGE"),
                    new Source(),
                    opt(country),
                    opt(modifier));

    return verNot(Version.Cloud, ret);
  }

}