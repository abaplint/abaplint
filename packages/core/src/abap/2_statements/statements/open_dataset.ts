import {IStatement} from "./_statement";
import {verNot, str, seqs, alt, per, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OpenDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seqs("IN",
                      opt(str("LEGACY")),
                      alt(str("BINARY MODE"),
                          str("TEXT MODE")));

    const code = seqs("CODE PAGE", Source);

    const direction = seqs("FOR", alt(str("OUTPUT"), str("INPUT"), str("UPDATE"), str("APPENDING")));
    const encoding = seqs("ENCODING", alt(str("DEFAULT"), str("UTF-8"), str("NON-UNICODE")));
    const pos = seqs("AT POSITION", Source);
    const message = seqs("MESSAGE", Target);
    const ignoring = str("IGNORING CONVERSION ERRORS");
    const replacement = seqs("REPLACEMENT CHARACTER", Source);
    const bom = str("SKIPPING BYTE-ORDER MARK");
    const wbom = str("WITH BYTE-ORDER MARK");
    const type = seqs("TYPE", Source);
    const filter = seqs("FILTER", Source);
    const linetype = alt(str("SMART"), str("NATIVE"), str("UNIX"));
    const feed = seqs("WITH", linetype, "LINEFEED");
    const windows = str("WITH WINDOWS LINEFEED");

    const ret = seqs("OPEN DATASET",
                     Target,
                     per(direction, type, mode, wbom, replacement, filter, encoding, pos, message, ignoring, bom, code, feed, windows));

    return verNot(Version.Cloud, ret);
  }

}