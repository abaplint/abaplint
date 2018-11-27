import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, IStatementRunnable} from "../combi";
import {FormName} from "../expressions";
import {Version} from "../../version";

export class Module extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("MODULE"),
                    new FormName(),
                    opt(alt(str("INPUT"), str("OUTPUT"))));

    return verNot(Version.Cloud, ret);
  }

}