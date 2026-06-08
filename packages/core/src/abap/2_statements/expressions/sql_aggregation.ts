import {seq, altPrio, tok, Expression, optPrio, ver} from "../combi";
import {ParenLeft, ParenLeftW, WParenRightW, WParenRight, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {SQLFunctionInput} from "./sql_function_input";
import {SQLFieldName} from "./sql_field_name";
import {SQLOver} from "./sql_over";

const lparen = altPrio(tok(ParenLeft), tok(ParenLeftW));
const rparen = altPrio(tok(WParenRightW), tok(WParenRight), tok(ParenRightW));

class SQLAggCount extends Expression {
  public getRunnable(): IStatementRunnable {
    const arg = altPrio(ver(Version.v740sp08, SQLFunctionInput), SQLFieldName);
    return seq("COUNT", lparen, optPrio("DISTINCT"), altPrio("*", arg), rparen, optPrio(SQLOver));
  }
}

class SQLAggMax extends Expression {
  public getRunnable(): IStatementRunnable {
    const arg = altPrio(ver(Version.v740sp08, SQLFunctionInput), SQLFieldName);
    return seq("MAX", lparen, optPrio("DISTINCT"), arg, rparen, optPrio(SQLOver));
  }
}

class SQLAggMin extends Expression {
  public getRunnable(): IStatementRunnable {
    const arg = altPrio(ver(Version.v740sp08, SQLFunctionInput), SQLFieldName);
    return seq("MIN", lparen, optPrio("DISTINCT"), arg, rparen, optPrio(SQLOver));
  }
}

class SQLAggSum extends Expression {
  public getRunnable(): IStatementRunnable {
    const arg = altPrio(ver(Version.v740sp08, SQLFunctionInput), SQLFieldName);
    return seq("SUM", lparen, optPrio("DISTINCT"), arg, rparen, optPrio(SQLOver));
  }
}

class SQLAggAvg extends Expression {
  public getRunnable(): IStatementRunnable {
    const avgRparen = altPrio(tok(WParenRightW), tok(WParenRight), tok(ParenRightW));
    const lenDecimals = seq(tok(ParenLeftW), SQLFunctionInput, ",", SQLFunctionInput, tok(WParenRightW));
    const avgCastType = altPrio(
      seq("DEC", lenDecimals),
      seq("CURR", lenDecimals),
      seq("QUAN", lenDecimals),
      "D16N",
      "D34N",
      "FLTP",
    );
    const arg = altPrio(ver(Version.v740sp08, SQLFunctionInput), SQLFieldName);
    return seq("AVG", tok(ParenLeftW), optPrio("DISTINCT"), arg,
               optPrio(ver(Version.v751, seq("AS", avgCastType))), avgRparen, optPrio(SQLOver));
  }
}

class SQLAggRank extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v757, seq(altPrio("ROW_NUMBER", "RANK", "DENSE_RANK"), lparen, rparen, SQLOver));
  }
}

class SQLAggLeadLag extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v757, seq(altPrio("LEAD", "LAG"),
                                 tok(ParenLeftW),
                                 SQLFunctionInput,
                                 optPrio(seq(",", SQLFunctionInput, optPrio(seq(",", SQLFunctionInput)))),
                                 rparen,
                                 SQLOver));
  }
}

class SQLAggFirstLastValue extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v757, seq(altPrio("FIRST_VALUE", "LAST_VALUE"),
                                 tok(ParenLeftW), SQLFunctionInput, rparen,
                                 SQLOver));
  }
}

class SQLAggStringAgg extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v757, seq("STRING_AGG",
                                 tok(ParenLeftW),
                                 SQLFunctionInput,
                                 optPrio(seq(",", SQLFunctionInput)),
                                 rparen,
                                 optPrio(SQLOver)));
  }
}

class SQLAggNtile extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v757, seq("NTILE", tok(ParenLeftW), SQLFunctionInput, rparen, SQLOver));
  }
}

class SQLAggCorr extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v757, seq(altPrio("CORR_SPEARMAN", "CORR"),
                                 tok(ParenLeftW), SQLFunctionInput, ",", SQLFunctionInput, rparen,
                                 optPrio(SQLOver)));
  }
}

class SQLAggStat extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v757, seq(altPrio("PRODUCT", "MEDIAN", "VAR", "STDDEV"),
                                 tok(ParenLeftW), SQLFunctionInput, rparen,
                                 optPrio(SQLOver)));
  }
}

export class SQLAggregation extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(SQLAggRank, SQLAggLeadLag, SQLAggFirstLastValue, SQLAggStringAgg,
                   SQLAggNtile, SQLAggCorr, SQLAggStat,
                   SQLAggCount, SQLAggMax, SQLAggMin, SQLAggSum, SQLAggAvg);
  }
}
