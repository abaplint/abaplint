import {IStatement} from "./_statement";
import {seq, alt, opt, per, optPrio, altPrio, ver, verNotLang} from "../combi";
import {FSTarget, Target, Source, Dynamic, TypeName, AssignSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release, LanguageVersion} from "../../../version";

export class Assign implements IStatement {

  public getMatcher(): IStatementRunnable {

    const dynamicType = altPrio(verNotLang(LanguageVersion.KeyUser, Dynamic), TypeName);
    const type = seq("TYPE", dynamicType);
    const like = seq("LIKE", altPrio(Dynamic, Source));
    const handle = seq("TYPE HANDLE", Source);
    const range = seq("RANGE", Source);
    const decimals = seq("DECIMALS", Source);

    const castingType = seq("CASTING", opt(alt(like, handle, per(type, decimals))));
    // CASTING TYPE (dyntype) blocked in KeyUser
    const casting = verNotLang(LanguageVersion.KeyUser, castingType);
    const obsoleteType = seq("TYPE", Source, optPrio(decimals));

    const ret = seq("ASSIGN",
                    // INCREMENT addition blocked in KeyUser
                    opt(verNotLang(LanguageVersion.KeyUser, seq(Target, "INCREMENT"))),
                    AssignSource,
                    "TO",
                    FSTarget,
                    opt(altPrio(casting, obsoleteType, decimals)),
                    opt(range),
                    opt(ver(Release.v757, "ELSE UNASSIGN")));

    return ret;
  }

}