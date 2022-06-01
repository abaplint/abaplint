import {IStatement} from "./_statement";
import {seq, ver, tok, plus, optPrio} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class ReadEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq("READ ENTITIES OF", SimpleName,
                  "IN LOCAL MODE",
                  "ENTITY", SimpleName,
                  "FIELDS", tok(WParenLeftW), plus(SimpleName), tok(WParenRightW),
                  "WITH", Source,
                  "RESULT", Target,
                  optPrio(seq("FAILED", Target)),
                  optPrio(seq("REPORTED", Target)));
    return ver(Version.v754, s);
  }

}