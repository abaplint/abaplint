import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Structures from "../abap/3_structures/structures";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {Program} from "../objects";
import {StatementNode, StructureNode} from "../abap/nodes";
import {DECLARATION_STUFF, SELECTION_EVENTS} from "../abap/flow/selection_events";

export class EmptyEventConf extends BasicRuleConfig {
}

export class EmptyEvent extends ABAPRule {

  private conf = new EmptyEventConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "empty_event",
      title: "Empty selection screen or list processing event block",
      shortDescription: `Empty selection screen or list processing event block`,
      extendedInformation: ``,
      tags: [RuleTag.SingleFile],
      badExample: `REPORT zfoo.
START-OF-SELECTION.
  PERFORM sdf.
  COMMIT WORK.
END-OF-SELECTION.`,
      goodExample: `REPORT zfoo.
START-OF-SELECTION.
  PERFORM sdf.
  COMMIT WORK.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: EmptyEventConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];

    if (!(obj instanceof Program) || obj.isInclude()) {
      return issues;
    }

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    let currentEvent: StatementNode | undefined = undefined;
    let children: (StatementNode | StructureNode)[] = [];
    for (const s of stru.getChildren() || []) {
      if (SELECTION_EVENTS.some(f => s.get() instanceof f)) {
        if (currentEvent !== undefined && children.length === 0) {
          issues.push(Issue.atStatement(file, currentEvent, "Empty event", this.getMetadata().key, this.getConfig().severity));
        }

        children = [];
        currentEvent = s as StatementNode;
      } else if (s.get() instanceof Structures.Normal) {
        const stru = s as StructureNode;
        // ignore declaration stuff
        if (DECLARATION_STUFF.some(d => stru.getFirstStatement()?.get() instanceof d)) {
          continue;
        }
        children.push(s);
      } else {
        children = [];
      }
    }

    if (currentEvent !== undefined && children.length === 0) {
      issues.push(Issue.atStatement(file, currentEvent, "Empty event", this.getMetadata().key, this.getConfig().severity));
    }

    return issues;
  }

}
