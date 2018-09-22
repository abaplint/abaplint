import {Statement} from "./statement";
import {verNot, str, seq, alt, per, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Open extends Statement {

  public static get_matcher(): IRunnable {
    let mode = seq(str("IN"),
                   opt(str("LEGACY")),
                   alt(str("BINARY MODE"),
                       str("TEXT MODE")));

    let code = seq(str("CODE PAGE"), new Source());

    let direction = seq(str("FOR"), alt(str("OUTPUT"), str("INPUT"), str("APPENDING")));
    let encoding = seq(str("ENCODING"), new Source());
    let pos = seq(str("AT POSITION"), new Source());
    let message = seq(str("MESSAGE"), new Target());
    let ignoring = str("IGNORING CONVERSION ERRORS");
    let bom = str("SKIPPING BYTE-ORDER MARK");
    let type = seq(str("TYPE"), new Source());

    let ret = seq(str("OPEN DATASET"),
                  new Target(),
                  per(direction, type, mode, encoding, pos, message, ignoring, bom, code));

    return verNot(Version.Cloud, ret);
  }

}