import {Statement} from "./_statement";
import {verNot, str, seq, alt, per, opt, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class OpenDataset extends Statement {

  public getMatcher(): IStatementRunnable {
    const mode = seq(str("IN"),
                     opt(str("LEGACY")),
                     alt(str("BINARY MODE"),
                         str("TEXT MODE")));

    const code = seq(str("CODE PAGE"), new Source());

    const direction = seq(str("FOR"), alt(str("OUTPUT"), str("INPUT"), str("UPDATE"), str("APPENDING")));
    const encoding = seq(str("ENCODING"), alt(str("DEFAULT"), str("UTF-8"), str("NON-UNICODE")));
    const pos = seq(str("AT POSITION"), new Source());
    const message = seq(str("MESSAGE"), new Target());
    const ignoring = str("IGNORING CONVERSION ERRORS");
    const replacement = seq(str("REPLACEMENT CHARACTER"), new Source());
    const bom = str("SKIPPING BYTE-ORDER MARK");
    const wbom = str("WITH BYTE-ORDER MARK");
    const type = seq(str("TYPE"), new Source());
    const filter = seq(str("FILTER"), new Source());
    const linetype = alt(str("SMART"), str("NATIVE"), str("UNIX"));
    const feed = seq(str("WITH"), linetype, str("LINEFEED"));
    const windows = str("WITH WINDOWS LINEFEED");

    const ret = seq(str("OPEN DATASET"),
                    new Target(),
                    per(direction, type, mode, wbom, replacement, filter, encoding, pos, message, ignoring, bom, code, feed, windows));

    return verNot(Version.Cloud, ret);
  }

}