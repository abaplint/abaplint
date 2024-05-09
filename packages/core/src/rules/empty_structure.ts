import {Issue} from "../issue";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {StructureNode} from "../abap/nodes";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Unknown} from "../abap/2_statements/statements/_statement";

export class EmptyStructureConf extends BasicRuleConfig {
  /** Checks for empty LOOP blocks */
  public loop: boolean = true;
  /** Allow empty if subrc is checked after the loop */
  public loopAllowIfSubrc: boolean = true;
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
  /** Checks for empty WHEN blocks */
  public when: boolean = true;
  // todo, other category containing ELSE
}

export class EmptyStructure extends ABAPRule {

  private conf = new EmptyStructureConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "empty_structure",
      title: "Find empty blocks",
      shortDescription: `Checks that the code does not contain empty blocks.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#no-empty-if-branches`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
      badExample: `IF foo = bar.
ENDIF.

DO 2 TIMES.
ENDDO.`,
      goodExample: `LOOP AT itab WHERE qty = 0 OR date > sy-datum.
ENDLOOP.
result = xsdbool( sy-subrc = 0 ).`,
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

    const statements = file.getStatements();
    for (const statement of statements) {
      if (statement.get() instanceof Unknown) {
        return []; // contains parser errors
      }
    }

    const candidates: StructureNode[] = [];
    if (this.getConfig().while === true) {
      candidates.push(...stru.findAllStructuresRecursive(Structures.While));
    }
    if (this.getConfig().case === true) {
      candidates.push(...stru.findAllStructuresRecursive(Structures.Case));
    }
    if (this.getConfig().select === true) {
      candidates.push(...stru.findAllStructuresRecursive(Structures.Select));
    }
    if (this.getConfig().do === true) {
      candidates.push(...stru.findAllStructuresRecursive(Structures.Do));
    }
    if (this.getConfig().at === true) {
      candidates.push(...stru.findAllStructuresRecursive(Structures.At));
      candidates.push(...stru.findAllStructuresRecursive(Structures.AtFirst));
      candidates.push(...stru.findAllStructuresRecursive(Structures.AtLast));
    }

    for (const l of candidates) {
      if (l.getChildren().length === 2) {
        const token = l.getFirstToken();
        const issue = Issue.atToken(file, token, this.getDescription(l.get().constructor.name), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    if (this.getConfig().try === true) {
      const tries = stru.findAllStructuresRecursive(Structures.Try);
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

    if (this.getConfig().loop === true) {
      const loops = stru.findAllStructuresRecursive(Structures.Loop);
      for (const loop of loops) {
        if (loop.getChildren().length === 2) {
          const endloopStatement = loop.getLastChild();
          const endloopIndex = statements.findIndex((s) => s === endloopStatement);
          const afterEndloop = statements[endloopIndex + 1];
          if (afterEndloop !== undefined && afterEndloop.concatTokens().toUpperCase().includes("SY-SUBRC")) {
            continue;
          }

          const token = loop.getFirstToken();
          const issue = Issue.atToken(
            file, token, this.getDescription(loop.get().constructor.name), this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }
    }

    if (this.getConfig().if === true) {
      const tries = stru.findAllStructuresRecursive(Structures.If)
        .concat(stru.findAllStructuresRecursive(Structures.Else))
        .concat(stru.findAllStructuresRecursive(Structures.ElseIf));
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

    if (this.getConfig().when === true) {
      const tries = stru.findAllStructuresRecursive(Structures.When);

      for (const t of tries) {
        if (t.getChildren().length === 1) {
          const token = t.getFirstToken();
          const message = this.getDescription(t.get().constructor.name);
          const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}