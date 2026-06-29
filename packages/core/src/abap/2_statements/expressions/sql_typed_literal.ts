import {seq, Expression, regex as reg} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

const TYPED_LITERAL_TYPES = [
  "CHAR", "CLNT", "CUKY", "CURR", "DATN", "DATS", "DEC",
  "DECFLOAT16", "DECFLOAT34",
  "D16N", "D34N", "D16D", "D34D", "D16R", "D34R",
  "FLTP",
  "INT1", "INT2", "INT4", "INT8",
  "LANG", "NUMC", "QUAN", "RAW", "RAWSTRING",
  "SSTRING", "STRING", "TIMN", "TIMS", "UNIT", "UTCLONG",
];

export class SQLTypedLiteral extends Expression {
  public getRunnable(): IStatementRunnable {
    const typeName = reg(new RegExp("^(" + TYPED_LITERAL_TYPES.join("|") + ")$", "i"));
    return seq(typeName, reg(/^`.*`$/));
  }
}
