import {IStatement} from "./_statement";
import {str, seq, ver, tok} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class ReadEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq(str("READ ENTITIES OF"), new SimpleName(),
                  str("IN LOCAL MODE"),
                  str("ENTITY"), new SimpleName(),
                  str("FIELDS"), tok(WParenLeftW), new SimpleName(), tok(WParenRightW),
                  str("WITH"), new Source(),
                  str("RESULT"), new Target());
    return ver(Version.v754, s);
  }

}