import {seqs, tok, Expression, str, plus, ver, optPrio, alts} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentName, Source, Field} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentChain} from "./component_chain";

export class CorrespondingBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const mapping = seqs("MAPPING", plus(seqs(ComponentName, "=", ComponentChain)));

    const baseParen = seqs("BASE", tok(WParenLeftW), Source, tok(WParenRightW));

    const discarding = ver(Version.v751, str("DISCARDING DUPLICATES"));

    return seqs(
      optPrio(str("DEEP")),
      optPrio(baseParen),
      Source,
      optPrio(discarding),
      optPrio(mapping),
      optPrio(seqs("EXCEPT", alts(plus(new Field()), "*"))),
    );
  }
}