import {Registry, IProgress} from "../registry";
import {Runner} from "../runner";
import {Version, textToVersion, versionToText} from "../version";
import {Unknown} from "../abap/statements/_statement";

export interface ITotals {
  statements: number;
  tokens: number;
  files: number;
  objects: number;
}

export interface ITypeCount {
  type: string;
  count: number;
}

export interface IResult {
  version: string;
  target: string;
  time: string;
  totals: ITotals;
  objects: ITypeCount[];
  issues: ITypeCount[];
  statements: ITypeCount[];
}

export class Stats {
  private reg: Registry;

  constructor(reg: Registry) {
    this.reg = reg;
  }

  public run(progress?: IProgress): IResult {
    return {
      version: Runner.version(),
      target: versionToText(this.reg.getConfig().getVersion()),
      time: new Date().toISOString(),
      totals: this.buildTotals(),
      objects: this.buildObjects(),
      issues: this.buildIssues(),
      statements: this.buildStatements(progress),
    };
  }

// ////////////////////////////////////////////////

  private buildStatements(progress?: IProgress): ITypeCount[] {
    const ret: ITypeCount[] = [];
    for (const ver in Version) {
      if (isNaN(Number(ver))) {
        ret.push({type: ver, count: this.statementsVersion(textToVersion(ver), progress)});
      }
    }
    return ret;
  }

  private statementsVersion(ver: Version, progress?: IProgress): number {
    let result = 0;

    this.reg.setConfig(this.reg.getConfig().setVersion(ver));
    this.reg.parse(progress);

    for (const file of this.reg.getABAPFiles()) {
      for (const stat of file.getStatements()) {
        if (!(stat.get() instanceof Unknown)) {
          result = result + 1;
        }
      }
    }

    return result;
  }

  private buildIssues(): ITypeCount[] {
    const res: ITypeCount[] = [];
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

  private buildObjects(): ITypeCount[] {
    const res: ITypeCount[] = [];
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