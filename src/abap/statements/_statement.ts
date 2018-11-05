import {IRunnable} from "../combi";

export abstract class Statement {
  public abstract getMatcher(): IRunnable;
}

export class Unknown extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("Unknown Statement, get_matcher");
  }
}

export class Comment extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("Comment Statement, get_matcher");
  }
}

export class Empty extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("Empty Statement, get_matcher");
  }
}

export class MacroCall extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("MacroCall Statement, get_matcher");
  }
}

export class MacroContent extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("MacroContent Statement, get_matcher");
  }
}

export class NativeSQL extends Statement {
  public getMatcher(): IRunnable {
    throw new Error("NativeSQL Statement, get_matcher");
  }
}