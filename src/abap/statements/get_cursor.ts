import {Statement} from "./statement";
import {verNot, str, seq, per, IRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class GetCursor extends Statement {

  public static get_matcher(): IRunnable {
    let line = seq(str("LINE"), new Target());
    let field = seq(str("FIELD"), new Target());
    let offset = seq(str("OFFSET"), new Target());
    let value = seq(str("VALUE"), new Target());
    let length = seq(str("LENGTH"), new Target());
    let area = seq(str("AREA"), new Target());

    let ret = seq(str("GET CURSOR"),
                  per(line, field, offset, value, length, area));

    return verNot(Version.Cloud, ret);
  }

}