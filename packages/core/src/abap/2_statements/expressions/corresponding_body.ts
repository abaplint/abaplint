import {seq, tok, Expression, str, plus, ver, optPrio, alt} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentName, Source, Field} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentChain} from "./component_chain";

export class CorrespondingBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const mapping = seq(str("MAPPING"), plus(seq(new ComponentName(), str("="), new ComponentChain())));

    const baseParen = seq(str("BASE"), tok(WParenLeftW), new Source(), tok(WParenRightW));

    const discarding = ver(Version.v751, str("DISCARDING DUPLICATES"));

    return seq(
      optPrio(str("DEEP")),
      optPrio(baseParen),
      new Source(),
      optPrio(discarding),
      optPrio(mapping),
      optPrio(seq(str("EXCEPT"), alt(plus(new Field()), str("*")))),
    );
  }
}