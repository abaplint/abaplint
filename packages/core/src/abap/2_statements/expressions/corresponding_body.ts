import {seqs, tok, Expression, pluss, vers, optPrios, alts} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentName, Source, Field} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentChain} from "./component_chain";

export class CorrespondingBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const mapping = seqs("MAPPING", pluss(seqs(ComponentName, "=", ComponentChain)));

    const baseParen = seqs("BASE", tok(WParenLeftW), Source, tok(WParenRightW));

    const discarding = vers(Version.v751, "DISCARDING DUPLICATES");

    return seqs(
      optPrios("DEEP"),
      optPrios(baseParen),
      Source,
      optPrios(discarding),
      optPrios(mapping),
      optPrios(seqs("EXCEPT", alts(pluss(Field), "*"))),
    );
  }
}