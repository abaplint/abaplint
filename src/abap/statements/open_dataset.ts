import {Statement} from "./_statement";
import {verNot, str, seq, alt, per, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class OpenDataset extends Statement {

  public getMatcher(): IRunnable {
    const mode = seq(str("IN"),
                     opt(str("LEGACY")),
                     alt(str("BINARY MODE"),
                         str("TEXT MODE")));

    const code = seq(str("CODE PAGE"), new Source());

    const direction = seq(str("FOR"), alt(str("OUTPUT"), str("INPUT"), str("APPENDING")));
    const encoding = seq(str("ENCODING"), new Source());
    const pos = seq(str("AT POSITION"), new Source());
    const message = seq(str("MESSAGE"), new Target());
    const ignoring = str("IGNORING CONVERSION ERRORS");
    const replacement = seq(str("REPLACEMENT CHARACTER"), new Source());
    const bom = str("SKIPPING BYTE-ORDER MARK");
    const wbom = str("WITH BYTE-ORDER MARK");
    const type = seq(str("TYPE"), new Source());
    const feed = str("WITH SMART LINEFEED");
    const windows = str("WITH WINDOWS LINEFEED");

    const ret = seq(str("OPEN DATASET"),
                    new Target(),
                    per(direction, type, mode, wbom, replacement, encoding, pos, message, ignoring, bom, code, feed, windows));

    return verNot(Version.Cloud, ret);
  }

}