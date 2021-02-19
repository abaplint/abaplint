import {IStatement} from "./_statement";
import {verNot, seq, opt, starPrio, tok} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Dash} from "../../1_lexer/tokens/dash";

export class EnhancementSection implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("ENHANCEMENT-SECTION",
                    seq(Field, starPrio(seq(tok(Dash), Field))),
                    "SPOTS",
                    Field,
                    opt("STATIC"),
                    opt("INCLUDE BOUND"));

    return verNot(Version.Cloud, ret);
  }

}