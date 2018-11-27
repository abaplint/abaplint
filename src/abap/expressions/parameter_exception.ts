import {seq, opt, str, Expression, IStatementRunnable} from "../combi";
import {Field, SimpleName, Target} from "./";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new Field(),
               str("="),
//               alt(new Constant, new FieldSub(), new FieldChain()),
               new SimpleName(),
               opt(seq(str("MESSAGE"), new Target())));
  }
}