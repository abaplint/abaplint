import {IStatement} from "./_statement";
import {verNot, seqs, opts, starPrios, tok} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Dash} from "../../1_lexer/tokens/dash";

export class EnhancementSection implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("ENHANCEMENT-SECTION",
                     seqs(Field, starPrios(seqs(tok(Dash), new Field()))),
                     "SPOTS",
                     Field,
                     opts("STATIC"));

    return verNot(Version.Cloud, ret);
  }

}