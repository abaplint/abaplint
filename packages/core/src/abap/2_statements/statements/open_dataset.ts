import {IStatement} from "./_statement";
import {verNot, str, seqs, alts, per, opts} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OpenDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seqs("IN",
                      opts("LEGACY"),
                      alts("BINARY MODE",
                           "TEXT MODE"));

    const code = seqs("CODE PAGE", Source);

    const direction = seqs("FOR", alts("OUTPUT", "INPUT", "UPDATE", "APPENDING"));
    const encoding = seqs("ENCODING", alts("DEFAULT", "UTF-8", "NON-UNICODE"));
    const pos = seqs("AT POSITION", Source);
    const message = seqs("MESSAGE", Target);
    const ignoring = str("IGNORING CONVERSION ERRORS");
    const replacement = seqs("REPLACEMENT CHARACTER", Source);
    const bom = str("SKIPPING BYTE-ORDER MARK");
    const wbom = str("WITH BYTE-ORDER MARK");
    const type = seqs("TYPE", Source);
    const filter = seqs("FILTER", Source);
    const linetype = alts("SMART", "NATIVE", "UNIX");
    const feed = seqs("WITH", linetype, "LINEFEED");
    const windows = str("WITH WINDOWS LINEFEED");

    const ret = seqs("OPEN DATASET",
                     Target,
                     per(direction, type, mode, wbom, replacement, filter, encoding, pos, message, ignoring, bom, code, feed, windows));

    return verNot(Version.Cloud, ret);
  }

}