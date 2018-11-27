import {Statement} from "./_statement";
import {verNot, str, seq, per, IStatementRunnable, opt} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class GetCursor extends Statement {

  public getMatcher(): IStatementRunnable {
    const line = seq(str("LINE"), new Target());
    const field = seq(str("FIELD"), new Target());
    const offset = seq(str("OFFSET"), new Target());
    const value = seq(str("VALUE"), new Target());
    const length = seq(str("LENGTH"), new Target());
    const area = seq(str("AREA"), new Target());

    const ret = seq(str("GET CURSOR"),
                    per(line, opt(str("DISPLAY")), field, offset, value, length, area));

    return verNot(Version.Cloud, ret);
  }

}