import {IStatement} from "./_statement";
import {verNot, str, seq, alt, per, opt, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class NewPage implements IStatement {

  public getMatcher(): IStatementRunnable {
    const line = seq(str("LINE-SIZE"), new Source());
    const print = seq(str("PRINT"), alt(str("OFF"), str("ON")));
    const parameters = seq(str("PARAMETERS"), new Source());
    const destination = seq(str("DESTINATION"), new Source());
    const archive = seq(str("ARCHIVE PARAMETERS"), new Source());
    const lineCount = seq(str("LINE-COUNT"), new Source());
    const coverText = seq(str("COVER TEXT"), new Source());
    const coverPage = seq(str("SAP COVER PAGE"), new Source());
    const immediately = seq(str("IMMEDIATELY"), new Source());
    const keep = seq(str("KEEP IN SPOOL"), new Source());
    const layout = seq(str("LAYOUT"), new Source());
    const listAuth = seq(str("LIST AUTHORITY"), new Source());
    const dataset = seq(str("LIST DATASET"), new Source());
    const name = seq(str("LIST NAME"), new Source());
    const newList = seq(str("NEW LIST IDENTIFICATION"), new Source());

    const ret = seq(str("NEW-PAGE"),
                    opt(per(print,
                            alt(str("NO-TITLE"), str("WITH-TITLE")),
                            alt(str("NO-HEADING"), str("WITH-HEADING")),
                            str("NO DIALOG"),
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
                            str("NEW-SECTION"),
                            lineCount,
                            line)));

    return verNot(Version.Cloud, ret);
  }

}