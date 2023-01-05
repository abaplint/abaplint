import {seq, optPrio, altPrio, tok, regex as reg, Expression} from "../combi";
import {ParenLeft, ParenRightW, Plus} from "../../1_lexer/tokens";
import {SimpleFieldChain2} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const normal = seq(optPrio(tok(Plus)),
                       altPrio(reg(/^\d+$/), SimpleFieldChain2));

    const length = seq(tok(ParenLeft),
                       altPrio(normal, "*"),
                       tok(ParenRightW));

    return length;
  }
}