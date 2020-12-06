import {IStatement} from "./_statement";
import {seqs, alts, opts, vers, optPrios, altPrios} from "../combi";
import {Version} from "../../../version";
import {Source, Field, ParameterListS, ClassName, MessageSource, BasicSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Raise implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seqs("WITH",
                     Source,
                     opts(Source),
                     opts(Source),
                     opts(Source));

    const mess = seqs("MESSAGE",
                      MessageSource,
                      opts(wit));

    const messid = seqs("MESSAGE ID",
                        Source,
                        "NUMBER",
                        Source,
                        optPrios(wit));

    const exporting = seqs("EXPORTING", ParameterListS);

    const from = altPrios(seqs("TYPE", ClassName),
                          altPrios(vers(Version.v752, Source), BasicSource));

    const clas = seqs(optPrios("RESUMABLE"),
                      "EXCEPTION",
                      from,
                      opts(alts(vers(Version.v750, alts(mess, messid)), vers(Version.v752, "USING MESSAGE"))),
                      optPrios(exporting));

    const ret = seqs("RAISE", altPrios(clas, Field));

    return ret;
  }

}