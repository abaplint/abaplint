import {IStatement} from "./_statement";
import {seq, alt, opt, ver, optPrio, altPrio, AlsoIn, verNotLang} from "../combi";
import {Release, LanguageVersion} from "../../../version";
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
                     opt(alt(ver(Release.v750, alt(mess, messid), {also: AlsoIn.OpenABAP}), ver(Release.v752, "USING MESSAGE"))),
                     optPrio(exporting));

    const pre = altPrio(seq(optPrio("RESUMABLE"), "EXCEPTION"), "SHORTDUMP");

    const clas = seq(pre,
                     altPrio(from, ver(Release.v752, Source, {also: AlsoIn.OpenABAP}), SimpleSource2));

    // Old form "RAISE exception_name" blocked in KeyUser
    const ret = seq("RAISE", altPrio(clas, verNotLang(LanguageVersion.KeyUser, ExceptionName)));

    return ret;
  }

}