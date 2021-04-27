import {IStatement} from "./_statement";
import {seq, alt, opt, ver, optPrio, altPrio} from "../combi";
import {Version} from "../../../version";
import {Source, Field, ParameterListS, ClassName, MessageSource, SimpleSource2} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Raise implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seq("WITH",
                    Source,
                    opt(Source),
                    opt(Source),
                    opt(Source));

    const mess = seq("MESSAGE",
                     MessageSource,
                     opt(wit));

    const messid = seq("MESSAGE ID",
                       Source,
                       "NUMBER",
                       Source,
                       optPrio(wit));

    const exporting = seq("EXPORTING", ParameterListS);

    const from = seq("TYPE",
                     ClassName,
                     opt(alt(ver(Version.v750, alt(mess, messid)), ver(Version.v752, "USING MESSAGE"))),
                     optPrio(exporting));

    const clas = seq(optPrio("RESUMABLE"),
                     "EXCEPTION",
                     altPrio(from, ver(Version.v752, Source), SimpleSource2));

    const ret = seq("RAISE", altPrio(clas, Field));

    return ret;
  }

}