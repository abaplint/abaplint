import {seq, tok, optPrio, altPrio, regex as reg, Expression, ver} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW, AssociationName} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLCDSParameters} from "./sql_cds_parameters";
import {SQLCond} from "./sql_cond";
import {SQLPathCardinality} from "./sql_path_cardinality";
import {SQLPathJoinType} from "./sql_path_join_type";
import {Release} from "../../../version";

export class SQLPathSegment extends Expression {
  private readonly nws: boolean;

  public constructor(nws: boolean = false) {
    super();
    this.nws = nws;
  }

  public getRunnable(): IStatementRunnable {
    const filter = ver(Release.v751, seq(
      tok(BracketLeftW),
      optPrio(SQLPathCardinality),
      optPrio(SQLPathJoinType),
      optPrio(seq(optPrio("WHERE"), SQLCond)),
      altPrio(tok(WBracketRightW), tok(WBracketRight)),
    ));
    const params = ver(Release.v751, SQLCDSParameters);

    const name = this.nws
      ? tok(AssociationName)
      : altPrio(tok(AssociationName), reg(/^\\[\w]+$/));

    return ver(Release.v740sp05, seq(name, optPrio(altPrio(
      seq(params, optPrio(filter)),
      filter,
    ))));
  }
}
