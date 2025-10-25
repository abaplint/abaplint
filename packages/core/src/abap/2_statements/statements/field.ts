import {IStatement} from "./_statement";
import {verNot, seq, opt, alt, tok, altPrio, starPrio} from "../combi";
import {Constant, FieldChain, FormName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ParenRightW, WParenLeft} from "../../1_lexer/tokens";

export class Field implements IStatement {

  public getMatcher(): IStatementRunnable {
    const module = seq("MODULE", FormName, opt(alt("ON INPUT", "ON REQUEST", "ON CHAIN-REQUEST", "AT CURSOR-SELECTION")));
    const values = seq("VALUES", tok(WParenLeft), "BETWEEN", Constant, "AND", Constant, tok(ParenRightW));
    const wit = seq("WITH", FieldChain);

    const cond = seq(FieldChain, "=", FieldChain);
    const where = seq(cond, starPrio(seq("AND", cond)));
    const select = seq("SELECT * FROM", FieldChain, "WHERE", where, "INTO RESULT WHENEVER NOT FOUND SEND ERRORMESSAGE");

    const ret = seq("FIELD", FieldChain, opt(altPrio(module, values, wit, select)));

    return verNot(Version.Cloud, ret);
  }

}