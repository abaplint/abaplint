import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, IRunnable} from "../combi";
import {FormName} from "../expressions";
import {Version} from "../../version";

export class Module extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("MODULE"),
                    new FormName(),
                    opt(alt(str("INPUT"), str("OUTPUT"))));

    return verNot(Version.Cloud, ret);
  }

}