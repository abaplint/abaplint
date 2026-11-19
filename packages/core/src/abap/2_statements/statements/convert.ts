import {IStatement} from "./_statement";
import {seq, alt, per, ver, AlsoIn, verNotLang} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release, LanguageVersion} from "../../../version";

export class Convert implements IStatement {

  public getMatcher(): IStatementRunnable {
    const intoTime = seq("TIME", Target);
    const intoDate = seq("DATE", Target);
    const into = seq("INTO", per(intoTime, intoDate));

    const daylightSource = seq("DAYLIGHT SAVING TIME", Source);
    const daylightTarget = seq("DAYLIGHT SAVING TIME", Target);
    const zone = seq("TIME ZONE", Source);

    const time = seq("TIME STAMP",
                     Source,
                     per(zone, into, daylightTarget));

    const dat = seq("DATE", Source);
    const tim = seq("TIME", Source);

    const stamp = seq("INTO TIME STAMP", Target);
    const intoutc = ver(Release.v754, seq("INTO UTCLONG", Target), {also: AlsoIn.OpenABAP});
    const invert = verNotLang(LanguageVersion.Cloud, seq("INTO INVERTED-DATE", Target));

    const date = seq(per(dat, tim),
                     per(daylightSource, stamp, zone, invert, intoutc));

    const inv = verNotLang(LanguageVersion.Cloud, seq("INVERTED-DATE", Source, "INTO DATE", Target));

    const utclong = ver(Release.v754, seq("UTCLONG", Source, per(zone, into, daylightTarget)), {also: AlsoIn.OpenABAP});

    return seq("CONVERT", alt(time, date, inv, utclong));
  }

}
