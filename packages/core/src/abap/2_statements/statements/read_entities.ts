import {IStatement} from "./_statement";
import {seq, ver, tok, plus, alt, optPrio, opt} from "../combi";
import {AssociationName, EntityAssociation, NamespaceSimpleName, SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class ReadEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seq("FROM", Source);
    const fields = seq("FIELDS", tok(WParenLeftW), plus(SimpleName), tok(WParenRightW), "WITH", Source);
    const all = seq("ALL FIELDS WITH", Source);
    const result = seq("RESULT", Target);
    const failed = seq("FAILED", Target);
    const reported = seq("REPORTED", Target);

    const entity = seq("ENTITY", NamespaceSimpleName,
                       opt(seq("BY", AssociationName)),
                       alt(fields, from, all),
                       optPrio(result));

    const s = seq("ENTITIES OF", NamespaceSimpleName,
                  opt("IN LOCAL MODE"),
                  plus(entity),
                  optPrio(seq("LINK", Target)),
                  optPrio(failed),
                  optPrio(reported));

    const by = seq("BY", AssociationName, fields);

    const single = seq("ENTITY", opt("IN LOCAL MODE"), alt(NamespaceSimpleName, EntityAssociation), alt(all, fields, from, by), result, optPrio(failed), optPrio(reported));
    return ver(Version.v754, seq("READ", alt(s, single)));
  }

}