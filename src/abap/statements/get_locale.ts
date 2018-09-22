import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class GetLocale extends Statement {

  public static get_matcher(): IRunnable {
    let country = seq(str("COUNTRY"), new Target());

    let modifier = seq(str("MODIFIER"), new Target());

    let ret = seq(str("GET LOCALE LANGUAGE"),
                  new Target(),
                  country,
                  opt(modifier));

    return verNot(Version.Cloud, ret);
  }

}