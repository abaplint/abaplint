import {seq, tok, altPrio, ver} from "../combi";
import {Dash, InstanceArrow, ParenLeft, ParenRight, ParenRightW} from "../../1_lexer/tokens";
import {Constant} from "./constant";
import {FieldChain} from "./field_chain";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

const dynIdent = tok(ParenLeft);
const dynClose = altPrio(tok(ParenRight), tok(ParenRightW));
const dynInside = altPrio(new FieldChain(), Constant);

export function dynComp(...inside: IStatementRunnable[]): IStatementRunnable {
  return ver(Version.v757, seq(tok(Dash), dynIdent, dynInside, ...inside, dynClose));
}

export function dynAttr(): IStatementRunnable {
  return ver(Version.v757, seq(tok(InstanceArrow), dynIdent, dynInside, dynClose));
}
