import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class GetLocale extends Statement {

  public static get_matcher(): IRunnable {
    let country = seq(str("COUNTRY"), new Reuse.Target());

    let modifier = seq(str("MODIFIER"), new Reuse.Target());

    let ret = seq(str("GET LOCALE LANGUAGE"),
                  new Reuse.Target(),
                  country,
                  opt(modifier));

    return ret;
  }

}