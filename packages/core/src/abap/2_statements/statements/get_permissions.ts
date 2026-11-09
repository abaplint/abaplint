import {IStatement} from "./_statement";
import {alt, altPrio, opt, optPrio, per, plus, seq, ver, AlsoIn} from "../combi";
import {Dynamic, EntityAssociation, NamespaceSimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class GetPermissions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const aspect = altPrio("FEATURES", "AUTHORIZATION");
    const only = seq("ONLY", altPrio(
      seq("GLOBAL", optPrio(aspect)),
      seq("INSTANCE", optPrio(aspect)),
      aspect,
      Dynamic));

    const query = seq("ENTITY", alt(NamespaceSimpleName, EntityAssociation),
                      optPrio(seq("FROM", Source)),
                      "REQUEST", Source,
                      "RESULT", Target);

    const long = seq("OF", NamespaceSimpleName, plus(query));
    const operations = seq("OPERATIONS", Source);

    const response = optPrio(per(seq("FAILED", Target), seq("REPORTED", Target)));

    const s = seq("GET PERMISSIONS",
                  optPrio(seq(opt("FORWARDING"), "PRIVILEGED")),
                  optPrio(only),
                  altPrio(long, operations, query),
                  response);
    return ver(Release.v754, s, {also: AlsoIn.OpenABAP});
  }

}
