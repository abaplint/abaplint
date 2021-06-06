import {seq, Expression, plus, regex as reg} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class OLEExporting extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(reg(/^[&_!#\*]?[\w\d\*%\$\?#]+$/), "=", Source);
    return seq("EXPORTING", plus(fields));
  }
}