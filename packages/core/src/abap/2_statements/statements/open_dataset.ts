import {IStatement} from "./_statement";
import {verNot, str, seq, altPrio, per, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OpenDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seq("IN",
                     opt("LEGACY"),
                     altPrio("BINARY MODE", "TEXT MODE"));

    const code = seq("CODE PAGE", Source);

    const direction = seq("FOR", altPrio("OUTPUT", "INPUT", "UPDATE", "APPENDING"));
    const encoding = seq("ENCODING", altPrio("DEFAULT", "UTF-8", "NON-UNICODE"));
    const pos = seq("AT POSITION", Source);
    const message = seq("MESSAGE", Target);
    const ignoring = str("IGNORING CONVERSION ERRORS");
    const replacement = seq("REPLACEMENT CHARACTER", Source);
    const bom = str("SKIPPING BYTE-ORDER MARK");
    const wbom = str("WITH BYTE-ORDER MARK");
    const type = seq("TYPE", Source);
    const filter = seq("FILTER", Source);
    const linetype = altPrio("SMART", "NATIVE", "UNIX");
    const feed = seq("WITH", linetype, "LINEFEED");
    const windows = str("WITH WINDOWS LINEFEED");

    const ret = seq("OPEN DATASET",
                    Source,
                    per(direction, type, mode, wbom, replacement, filter, encoding, pos, message, ignoring, bom, code, feed, windows));

    return verNot(Version.Cloud, ret);
  }

}