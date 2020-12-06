import {IStatement} from "./_statement";
import {verNot, seq, opt, starPrios, tok} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Dash} from "../../1_lexer/tokens/dash";

export class EnhancementSection implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("ENHANCEMENT-SECTION",
                    seq(Field, starPrios(seq(tok(Dash), Field))),
                    "SPOTS",
                    Field,
                    opt("STATIC"));

    return verNot(Version.Cloud, ret);
  }

}