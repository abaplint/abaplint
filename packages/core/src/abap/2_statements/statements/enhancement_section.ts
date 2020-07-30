import {IStatement} from "./_statement";
import {verNot, str, seq, opt, starPrio, tok} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Dash} from "../../1_lexer/tokens/dash";

export class EnhancementSection implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("ENHANCEMENT-SECTION"),
                    seq(new Field(), starPrio(seq(tok(Dash), new Field()))),
                    str("SPOTS"),
                    new Field(),
                    opt(str("STATIC")));

    return verNot(Version.Cloud, ret);
  }

}