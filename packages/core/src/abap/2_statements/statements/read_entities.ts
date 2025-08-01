import {IStatement} from "./_statement";
import {seq, ver, tok, plus, alt, optPrio, opt} from "../combi";
import {AssociationName, NamespaceSimpleName, SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class ReadEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seq("FROM", Source);
    const fields = seq("FIELDS", tok(WParenLeftW), plus(SimpleName), tok(WParenRightW), "WITH", Source);
    const all = seq("ALL FIELDS WITH", Source);

    const entity = seq("ENTITY", NamespaceSimpleName,
                       opt(seq("BY", AssociationName)),
                       alt(fields, from, all),
                       optPrio(seq("RESULT", Target)));

    const s = seq("READ ENTITIES OF", NamespaceSimpleName,
                  opt("IN LOCAL MODE"),
                  plus(entity),
                  optPrio(seq("LINK", Target)),
                  optPrio(seq("FAILED", Target)),
                  optPrio(seq("REPORTED", Target)));
    return ver(Version.v754, s);
  }

}