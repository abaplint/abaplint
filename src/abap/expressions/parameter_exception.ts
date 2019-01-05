import {seq, opt, str, Expression, IStatementRunnable} from "../combi";
import {ParameterName, SimpleName, Target} from "./";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new ParameterName(),
               str("="),
//               alt(new Constant, new FieldSub(), new FieldChain()),
               new SimpleName(),
               opt(seq(str("MESSAGE"), new Target())));
  }
}