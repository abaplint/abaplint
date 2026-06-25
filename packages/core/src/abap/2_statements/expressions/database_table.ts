import {altPrio, regex as reg, Expression, verNotLang} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {LanguageVersion} from "../../../version";

export class DatabaseTable extends Expression {
  private readonly noDynamic: boolean;

  public constructor(noDynamic: boolean = false) {
    super();
    this.noDynamic = noDynamic;
  }

  public getRunnable(): IStatementRunnable {
    if (this.noDynamic) {
      return altPrio(verNotLang(LanguageVersion.KeyUser, Dynamic), reg(/^\*?(\/\w+\/)?\w+$/));
    }
    return altPrio(Dynamic, reg(/^\*?(\/\w+\/)?\w+$/));
  }
}