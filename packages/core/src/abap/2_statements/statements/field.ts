import {IStatement} from "./_statement";
import {verNot, seq, opt, alt, tok} from "../combi";
import {Constant, FieldChain, FormName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ParenRightW, WParenLeft} from "../../1_lexer/tokens";

export class Field implements IStatement {

  public getMatcher(): IStatementRunnable {
    const module = seq("MODULE", FormName, opt(alt("ON INPUT", "ON REQUEST")));
    const values = seq("VALUES", tok(WParenLeft), "BETWEEN", Constant, "AND", Constant, tok(ParenRightW));
    const ret = seq("FIELD", FieldChain, opt(alt(module, values)));

    return verNot(Version.Cloud, ret);
  }

}