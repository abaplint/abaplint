import {IStatementRunnable} from "../statement_runnable";

export interface IStatement {
  getMatcher(): IStatementRunnable;
}

export class Unknown implements IStatement {
  public getMatcher(): IStatementRunnable {
    throw new Error("Unknown Statement, get_matcher");
  }
}

export class Comment implements IStatement {
  public getMatcher(): IStatementRunnable {
    throw new Error("Comment Statement, get_matcher");
  }
}

export class Empty implements IStatement {
  public getMatcher(): IStatementRunnable {
    throw new Error("Empty Statement, get_matcher");
  }
}

export class MacroCall implements IStatement {
  public getMatcher(): IStatementRunnable {
    throw new Error("MacroCall Statement, get_matcher");
  }
}

export class MacroContent implements IStatement {
  public getMatcher(): IStatementRunnable {
    throw new Error("MacroContent Statement, get_matcher");
  }
}

export class NativeSQL implements IStatement {
  public getMatcher(): IStatementRunnable {
    throw new Error("NativeSQL Statement, get_matcher");
  }
}