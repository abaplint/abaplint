import {IStatement} from "./_statement";
import {str, seqs, alts, opt, ver, optPrio, altPrios} from "../combi";
import {Version} from "../../../version";
import {Source, Field, ParameterListS, ClassName, MessageSource, BasicSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Raise implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seqs("WITH",
                     Source,
                     opt(new Source()),
                     opt(new Source()),
                     opt(new Source()));

    const mess = seqs("MESSAGE",
                      MessageSource,
                      opt(wit));

    const messid = seqs("MESSAGE ID",
                        Source,
                        "NUMBER",
                        Source,
                        optPrio(wit));

    const exporting = seqs("EXPORTING", ParameterListS);

    const from = altPrios(seqs("TYPE", ClassName),
                          altPrios(ver(Version.v752, new Source()), new BasicSource()));

    const clas = seqs(optPrio(str("RESUMABLE")),
                      "EXCEPTION",
                      from,
                      opt(alts(ver(Version.v750, alts(mess, messid)), ver(Version.v752, str("USING MESSAGE")))),
                      optPrio(exporting));

    const ret = seqs("RAISE", altPrios(clas, Field));

    return ret;
  }

}