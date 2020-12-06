import {seq, tok, Expression, pluss, vers, optPrio, alt} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentName, Source, Field} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentChain} from "./component_chain";

export class CorrespondingBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const mapping = seq("MAPPING", pluss(seq(ComponentName, "=", ComponentChain)));

    const baseParen = seq("BASE", tok(WParenLeftW), Source, tok(WParenRightW));

    const discarding = vers(Version.v751, "DISCARDING DUPLICATES");

    return seq(
      optPrio("DEEP"),
      optPrio(baseParen),
      Source,
      optPrio(discarding),
      optPrio(mapping),
      optPrio(seq("EXCEPT", alt(pluss(Field), "*"))),
    );
  }
}