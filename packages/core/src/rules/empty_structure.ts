import {Issue} from "../issue";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {StructureNode} from "../abap/nodes";
import {IRuleMetadata, RuleTag} from "./_irule";

export class EmptyStructureConf extends BasicRuleConfig {
  /** Checks for empty LOOP blocks */
  public loop: boolean = true;
  /** Checks for empty IF blocks */
  public if: boolean = true;
  /** Checks for empty WHILE blocks */
  public while: boolean = true;
  /** Checks for empty CASE blocks */
  public case: boolean = true;
  /** Checks for empty SELECT blockss */
  public select: boolean = true;
  /** Checks for empty DO blocks */
  public do: boolean = true;
  /** Checks for empty AT blocks */
  public at: boolean = true;
  /** Checks for empty TRY blocks */
  public try: boolean = true;
  // todo, other category containing WHEN, ELSE
}

export class EmptyStructure extends ABAPRule {

  private conf = new EmptyStructureConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "empty_structure",
      title: "Find empty blocks",
      shortDescription: `Checks that the code does not contain empty blocks.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#no-empty-if-branches`,
      tags: [RuleTag.Styleguide],
    };
  }

  private getDescription(name: string): string {
    return "Empty block, add code: " + name;
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
        const token = l.getFirstToken();
        const issue = Issue.atToken(file, token, this.getDescription(l.get().constructor.name), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    if (this.getConfig().try === true) {
      const tries = stru.findAllStructures(Structures.Try);
      for (const t of tries) {
        const normal = t.findDirectStructure(Structures.Normal);
        if (normal === undefined) {
          const token = t.getFirstToken();
          const issue = Issue.atToken(
            file,
            token,
            this.getDescription(t.get().constructor.name),
            this.getMetadata().key,
            this.conf.severity);
          issues.push(issue);
        }
      }
    }

    if (this.getConfig().if === true) {
      const tries = stru.findAllStructures(Structures.If)
        .concat(stru.findAllStructures(Structures.Else))
        .concat(stru.findAllStructures(Structures.ElseIf));
      for (const t of tries) {
        const normal = t.findDirectStructure(Structures.Body);
        if (normal === undefined) {
          const token = t.getFirstToken();
          const issue = Issue.atToken(
            file,
            token,
            this.getDescription(t.get().constructor.name),
            this.getMetadata().key,
            this.conf.severity);
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}