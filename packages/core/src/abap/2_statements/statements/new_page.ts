import {IStatement} from "./_statement";
import {verNot, seq, alt, pers, opts} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class NewPage implements IStatement {

  public getMatcher(): IStatementRunnable {
    const line = seq("LINE-SIZE", Source);
    const print = seq("PRINT", alt("OFF", "ON"));
    const parameters = seq("PARAMETERS", Source);
    const destination = seq("DESTINATION", Source);
    const archive = seq("ARCHIVE PARAMETERS", Source);
    const lineCount = seq("LINE-COUNT", Source);
    const coverText = seq("COVER TEXT", Source);
    const coverPage = seq("SAP COVER PAGE", Source);
    const immediately = seq("IMMEDIATELY", Source);
    const keep = seq("KEEP IN SPOOL", Source);
    const layout = seq("LAYOUT", Source);
    const listAuth = seq("LIST AUTHORITY", Source);
    const dataset = seq("LIST DATASET", Source);
    const name = seq("LIST NAME", Source);
    const newList = seq("NEW LIST IDENTIFICATION", Source);

    const ret = seq("NEW-PAGE",
                    opts(pers(print,
                              alt("NO-TITLE", "WITH-TITLE"),
                              alt("NO-HEADING", "WITH-HEADING"),
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