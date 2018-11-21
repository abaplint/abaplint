import {Registry} from "../registry";

export interface ITotals {
  statements: number;
  tokens: number;
  files: number;
  objects: number;
}

export interface IObjectCount {
  type: string;
  count: number;
}

export interface IIssueCount {
  type: string;
  count: number;
}

export interface IResult {
  totals: ITotals;
  objects: IObjectCount[];
  issues: IIssueCount[];
}

export class Stats {
  private reg: Registry;

  constructor(reg: Registry) {
    this.reg = reg;
  }

  public run(): IResult {
    return {
      totals: this.buildTotals(),
      objects: this.buildObjects(),
      issues: this.buildIssues(),
    };
  }

// ////////////////////////////////////////////////

  private buildIssues(): IIssueCount[] {
    const res: IIssueCount[] = [];
    for (const issue of this.reg.findIssues()) {
      let found = false;
      for (const r of res) {
        if (r.type === issue.getCode()) {
          r.count = r.count + 1;
          found = true;
        }
      }
      if (found === false) {
        res.push({type: issue.getCode(), count: 1});
      }
    }
    return res;
  }

  private buildObjects(): IObjectCount[] {
    const res: IObjectCount[] = [];
    for (const obj of this.reg.getObjects()) {
      let found = false;
      for (const r of res) {
        if (r.type === obj.getType()) {
          r.count = r.count + 1;
          found = true;
        }
      }
      if (found === false) {
        res.push({type: obj.getType(), count: 1});
      }
    }
    return res;
  }

  private buildTotals(): ITotals {
    return {
      objects: this.reg.getObjects().length,
      files: this.countFiles(),
      statements: this.countStatements(),
      tokens: this.countTokens(),
    };
  }

  private countStatements(): number {
    let result = 0;
    for (const file of this.reg.getABAPFiles()) {
      result = result + file.getStatements().length;
    }
    return result;
  }

  private countTokens(): number {
    let result = 0;
    for (const file of this.reg.getABAPFiles()) {
      result = result + file.getTokens().length;
    }
    return result;
  }

  private countFiles(): number {
    let result = 0;
    for (const obj of this.reg.getObjects()) {
      result = result + obj.getFiles().length;
    }
    return result;
  }
}