import {Issue} from "../issue";
import * as Structures from "../abap/structures";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {StructureNode} from "../abap/nodes";

/** Checks that the code does not contain empty blocks. */
export class EmptyStructureConf extends BasicRuleConfig {
  /** Checks for empty loop blocks */
  public loop: boolean = true;
  /** Checks for empty if blocks */
  public if: boolean = true;
  /** Checks for empty while blocks */
  public while: boolean = true;
  /** Checks for empty case blocks */
  public case: boolean = true;
  /** Checks for empty select blockss */
  public select: boolean = true;
  /** Checks for empty do blocks */
  public do: boolean = true;
  /** Checks for empty at blocks */
  public at: boolean = true;
// todo, other category containing WHEN, ELSE
}

export class EmptyStructure extends ABAPRule {

  private conf = new EmptyStructureConf();

  public getKey(): string {
    return "empty_structure";
  }

  public getDescription(name: string): string {
    return "Empty structure:" + name ;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: EmptyStructureConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    let candidates: StructureNode[] = [];
    if (this.getConfig().loop === true) {
      candidates = candidates.concat(stru.findAllStructures(Structures.Loop));
    }
    if (this.getConfig().if === true) {
      candidates = candidates.concat(stru.findAllStructures(Structures.If));
    }
    if (this.getConfig().while === true) {
      candidates = candidates.concat(stru.findAllStructures(Structures.While));
    }
    if (this.getConfig().case === true) {
      candidates = candidates.concat(stru.findAllStructures(Structures.Case));
    }
    if (this.getConfig().select === true) {
      candidates = candidates.concat(stru.findAllStructures(Structures.Select));
    }
    if (this.getConfig().do === true) {
      candidates = candidates.concat(stru.findAllStructures(Structures.Do));
    }
    if (this.getConfig().at === true) {
      candidates = candidates.concat(stru.findAllStructures(Structures.At));
    }

    for (const l of candidates) {
      if (l.getChildren().length === 2) {
        const issue = new Issue({file,
          message: this.getDescription(l.get().constructor.name),
          key: this.getKey(),
          start: l.getFirstToken().getStart()});
        issues.push(issue);
      }
    }

    return issues;
  }

}