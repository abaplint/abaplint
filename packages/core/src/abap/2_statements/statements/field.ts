import {IStatement} from "./_statement";
import {verNot, seq, opt, alt, tok, altPrio} from "../combi";
import {Constant, FieldChain, FormName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ParenRightW, WParenLeft} from "../../1_lexer/tokens";

export class Field implements IStatement {

  public getMatcher(): IStatementRunnable {
    const module = seq("MODULE", FormName, opt(alt("ON INPUT", "ON REQUEST", "ON CHAIN-REQUEST")));
    const values = seq("VALUES", tok(WParenLeft), "BETWEEN", Constant, "AND", Constant, tok(ParenRightW));
    const wit = seq("WITH", FieldChain);

    const ret = seq("FIELD", FieldChain, opt(altPrio(module, values, wit)));

    return verNot(Version.Cloud, ret);
  }

}