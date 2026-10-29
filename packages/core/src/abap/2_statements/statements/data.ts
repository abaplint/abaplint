import {IStatement} from "./_statement";
import {seq, optPrio, altPrio, tok} from "../combi";
import {DataDefinition, Integer} from "../expressions";
import {ParenLeft, ParenRight, ParenRightW, WParenLeft} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Data implements IStatement {

  public getMatcher(): IStatementRunnable {
    // unnamed field, only relevant inside DATA BEGIN OF
    const unnamed = seq(altPrio(tok(WParenLeft), tok(ParenLeft)), Integer, altPrio(tok(ParenRightW), tok(ParenRight)));

    return seq("DATA", altPrio(DataDefinition, unnamed), optPrio("%_PREDEFINED"));
  }

}