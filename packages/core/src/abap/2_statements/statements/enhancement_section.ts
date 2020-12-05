import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, starPrio, tok} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Dash} from "../../1_lexer/tokens/dash";

export class EnhancementSection implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("ENHANCEMENT-SECTION",
                     seqs(Field, starPrio(seqs(tok(Dash), new Field()))),
                     "SPOTS",
                     Field,
                     opt(str("STATIC")));

    return verNot(Version.Cloud, ret);
  }

}