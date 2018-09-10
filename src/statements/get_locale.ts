import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class GetLocale extends Statement {

  public static get_matcher(): IRunnable {
    let country = seq(str("COUNTRY"), new Target());

    let modifier = seq(str("MODIFIER"), new Target());

    let ret = seq(str("GET LOCALE LANGUAGE"),
                  new Target(),
                  country,
                  opt(modifier));

    return ret;
  }

}