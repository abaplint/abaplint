import {Statement} from "./_statement";
import {verNot, str, seq, alt, per, opt, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class NewPage extends Statement {

  public getMatcher(): IRunnable {
    let line = seq(str("LINE-SIZE"), new Source());
    let print = seq(str("PRINT"), alt(str("OFF"), str("ON")));
    let parameters = seq(str("PARAMETERS"), new Source());
    let destination = seq(str("DESTINATION"), new Source());
    let archive = seq(str("ARCHIVE PARAMETERS"), new Source());
    let lineCount = seq(str("LINE-COUNT"), new Source());
    let coverText = seq(str("COVER TEXT"), new Source());
    let coverPage = seq(str("SAP COVER PAGE"), new Source());
    let immediately = seq(str("IMMEDIATELY"), new Source());
    let keep = seq(str("KEEP IN SPOOL"), new Source());
    let layout = seq(str("LAYOUT"), new Source());
    let listAuth = seq(str("LIST AUTHORITY"), new Source());
    let dataset = seq(str("LIST DATASET"), new Source());
    let name = seq(str("LIST NAME"), new Source());
    let newList = seq(str("NEW LIST IDENTIFICATION"), new Source());

    let ret = seq(str("NEW-PAGE"),
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