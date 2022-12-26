import {IStatement} from "./_statement";
import {seq, alt, opt, ver, optPrio, altPrio} from "../combi";
import {Version} from "../../../version";
import {Source, ParameterListS, ClassName, MessageSource, SimpleSource2, RaiseWith, MessageNumber, ExceptionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Raise implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mess = seq("MESSAGE",
                     MessageSource,
                     opt(RaiseWith));

    const messid = seq("MESSAGE ID",
                       Source,
                       "NUMBER",
                       altPrio(MessageNumber, Source),
                       optPrio(RaiseWith));

    const exporting = seq("EXPORTING", ParameterListS);

    const from = seq("TYPE",
                     ClassName,
                     opt(alt(ver(Version.v750, alt(mess, messid)), ver(Version.v752, "USING MESSAGE"))),
                     optPrio(exporting));

    const pre = altPrio(seq(optPrio("RESUMABLE"), "EXCEPTION"), "SHORTDUMP");

    const clas = seq(pre,
                     altPrio(from, ver(Version.v752, Source), SimpleSource2));

    const ret = seq("RAISE", altPrio(clas, ExceptionName));

    return ret;
  }

}