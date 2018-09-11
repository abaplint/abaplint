import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetLocale extends Statement {

  public static get_matcher(): IRunnable {
    let country = seq(str("COUNTRY"), new Source());

    let modifier = seq(str("MODIFIER"), new Source());

    let ret = seq(str("SET LOCALE LANGUAGE"),
                  new Source(),
                  opt(country),
                  opt(modifier));

    return ret;
  }

}