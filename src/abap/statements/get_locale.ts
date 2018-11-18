import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class GetLocale extends Statement {

  public getMatcher(): IRunnable {
    const country = seq(str("COUNTRY"), new Target());

    const modifier = seq(str("MODIFIER"), new Target());

    const ret = seq(str("GET LOCALE LANGUAGE"),
                    new Target(),
                    country,
                    opt(modifier));

    return verNot(Version.Cloud, ret);
  }

}