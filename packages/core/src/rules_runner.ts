import {SyntaxLogic} from "./abap/5_syntax/syntax";
import {ArtifactsRules} from "./artifacts_rules";
import {Issue} from "./issue";
import {ABAPObject} from "./objects/_abap_object";
import {IObject} from "./objects/_iobject";
import {SkipLogic} from "./skip_logic";
import {ExcludeHelper} from "./utils/excludeHelper";
import {IRegistry, IRunInput} from "./_iregistry";

export class RulesRunner {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public objectsToCheck(objects: Iterable<IObject>): readonly IObject[] {
    const check: IObject[] = [];
    const skipLogic = new SkipLogic(this.reg);

    for (const obj of objects) {
      if (skipLogic.skip(obj) || this.reg.isDependency(obj)) {
        continue;
      }
      check.push(obj);
    }
    return check;
  }

  public runRules(objects: Iterable<IObject>, input?: IRunInput): readonly Issue[] {
    const rulePerformance: {[index: string]: number} = {};
    const issues = [];

    const rules = this.reg.getConfig().getEnabledRules();
    const check = this.objectsToCheck(objects);

    input?.progress?.set(check.length, "Run Syntax");
    for (const obj of check) {
      input?.progress?.tick("Run Syntax - " + obj.getName());
      if (obj instanceof ABAPObject) {
        new SyntaxLogic(this.reg, obj).run();
      }
    }

    input?.progress?.set(rules.length, "Initialize Rules");
    for (const rule of rules) {
      input?.progress?.tick("Initialize Rules - " + rule.getMetadata().key);
      if (rule.initialize === undefined) {
        throw new Error(rule.getMetadata().key + " missing initialize method");
      }
      rule.initialize(this.reg);
      rulePerformance[rule.getMetadata().key] = 0;
    }

    input?.progress?.set(check.length, "Finding Issues");
    for (const obj of check) {
      input?.progress?.tick("Finding Issues - " + obj.getType() + " " + obj.getName());
      for (const rule of rules) {
        const before = Date.now();
        issues.push(...rule.run(obj));
        const runtime = Date.now() - before;
        rulePerformance[rule.getMetadata().key] = rulePerformance[rule.getMetadata().key] + runtime;
      }
    }

    if (input?.outputPerformance === true) {
      const perf: {name: string, time: number}[] = [];
      for (const p in rulePerformance) {
        if (rulePerformance[p] > 100) { // ignore rules if it takes less than 100ms
          perf.push({name: p, time: rulePerformance[p]});
        }
      }
      perf.sort((a, b) => {return b.time - a.time;});
      for (const p of perf) {
        process.stderr.write("\t" + p.time + "ms\t" + p.name + "\n");
      }
    }

    return this.excludeIssues(issues);
  }

//////////////////////////////////

  private excludeIssues(issues: Issue[]): Issue[] {
    const ret: Issue[] = issues;

    const globalNoIssues = this.reg.getConfig().getGlobal().noIssues || [];
    const globalNoIssuesPatterns = globalNoIssues.map(x => new RegExp(x, "i"));
    if (globalNoIssuesPatterns.length > 0) {
      for (let i = ret.length - 1; i >= 0; i--) {
        const filename = ret[i].getFilename();
        if (ExcludeHelper.isExcluded(filename, globalNoIssuesPatterns)) {
          ret.splice(i, 1);
        }
      }
    }

    // exclude issues, as now we know both the filename and issue key
    for (const rule of ArtifactsRules.getRules()) {
      const key = rule.getMetadata().key;
      const ruleExclude: string[] = this.reg.getConfig().readByKey(key, "exclude") ?? [];
      if (ruleExclude.length === 0) {
        continue;
      }
      const ruleExcludePatterns = ruleExclude.map(x => new RegExp(x, "i"));

      for (let i = ret.length - 1; i >= 0; i--) {
        if (ret[i].getKey() !== key) {
          continue;
        }

        const filename = ret[i].getFilename();
        if (ExcludeHelper.isExcluded(filename, ruleExcludePatterns)) {
          ret.splice(i, 1);
        }
      }
    }

    return ret;
  }
}