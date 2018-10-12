import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class SetLocale extends Statement {

  public get_matcher(): IRunnable {
    let country = seq(str("COUNTRY"), new Source());

    let modifier = seq(str("MODIFIER"), new Source());

    let ret = seq(str("SET LOCALE LANGUAGE"),
                  new Source(),
                  opt(country),
                  opt(modifier));

    return verNot(Version.Cloud, ret);
  }

}