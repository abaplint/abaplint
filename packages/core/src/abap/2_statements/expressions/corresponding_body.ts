import {seqs, tok, Expression, str, plus, ver, optPrios, alts} from "../combi";
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
      optPrios("DEEP"),
      optPrios(baseParen),
      Source,
      optPrios(discarding),
      optPrios(mapping),
      optPrios(seqs("EXCEPT", alts(plus(new Field()), "*"))),
    );
  }
}