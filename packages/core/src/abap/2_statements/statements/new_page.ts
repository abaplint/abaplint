import {IStatement} from "./_statement";
import {verNot, seqs, alts, pers, opts} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class NewPage implements IStatement {

  public getMatcher(): IStatementRunnable {
    const line = seqs("LINE-SIZE", Source);
    const print = seqs("PRINT", alts("OFF", "ON"));
    const parameters = seqs("PARAMETERS", Source);
    const destination = seqs("DESTINATION", Source);
    const archive = seqs("ARCHIVE PARAMETERS", Source);
    const lineCount = seqs("LINE-COUNT", Source);
    const coverText = seqs("COVER TEXT", Source);
    const coverPage = seqs("SAP COVER PAGE", Source);
    const immediately = seqs("IMMEDIATELY", Source);
    const keep = seqs("KEEP IN SPOOL", Source);
    const layout = seqs("LAYOUT", Source);
    const listAuth = seqs("LIST AUTHORITY", Source);
    const dataset = seqs("LIST DATASET", Source);
    const name = seqs("LIST NAME", Source);
    const newList = seqs("NEW LIST IDENTIFICATION", Source);

    const ret = seqs("NEW-PAGE",
                     opts(pers(print,
                               alts("NO-TITLE", "WITH-TITLE"),
                               alts("NO-HEADING", "WITH-HEADING"),
                               "NO DIALOG",
                               parameters,
                               listAuth,
                               immediately,
                               dataset,
                               coverPage,
                               newList,
                               keep,
                               name,
                               layout,
                               destination,
                               coverText,
                               archive,
                               "NEW-SECTION",
                               lineCount,
                               line)));

    return verNot(Version.Cloud, ret);
  }

}