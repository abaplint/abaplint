import {altPrio, Expression, optPrio, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSString extends Expression {
  public getRunnable(): IStatementRunnable {
    const reg = regex(/^(?:'(?:[^'\\]|''|\\'|\\\\|\\(?!'))*'|"(?:[^"\\]|""|\\"|\\\\|\\(?!"))*")$/);
    const abapTypeName = regex(/^(?:int[1-9]|int8|sstring|sstr|char|numc|dats|datn|tims|timn|utcl|utclong|fltp|decfloat\d+|dec|string|rawstring|rstr|raw|xstring|clnt|lang|unit|cuky|curr|quan|geom_ewkb|d34n|d16n|d34d|d16d|d34s|d16s|d34r|d16r|d|t|p|n|c|x|f)$/i);
    const abap = seq("abap", ".", abapTypeName, optPrio(seq("(", regex(/^\d+$/), ")")), reg);
    return altPrio(abap, reg);
  }
}
