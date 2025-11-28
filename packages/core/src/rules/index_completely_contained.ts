import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRule, RuleTag} from "./_irule";
import {Issue} from "../issue";
import {Position} from "../position";
import * as Objects from "../objects";

export class IndexCompletelyContainedConf extends BasicRuleConfig {
// todo, add option to not allow any void types?
}

export class IndexCompletelyContained implements IRule {
  private conf = new IndexCompletelyContainedConf();

  public getMetadata() {
    return {
      key: "index_completely_contained",
      title: "Check if database table indexes are completely contained",
      shortDescription: `If indexes are completely contained in other indexes, they can be removed to improve performance.`,
      tags: [RuleTag.Performance],
    };
  }

  public initialize() {
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IndexCompletelyContainedConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof Objects.Table)) {
      return [];
    }

    const indexes = obj.getSecondaryIndexes();
    if (indexes === undefined || indexes.length === 0) {
      return [];
    }

    const issues: Issue[] = [];
    for (let i = 0; i < indexes.length; i++) {
      const indexA = indexes[i];
      for (let j = 0; j < indexes.length; j++) {
        if (i === j) {
          continue;
        }
        const indexB = indexes[j];

        let contained = true;
        for (const field of indexA.fields) {
          if (indexB.fields.indexOf(field) === -1) {
            contained = false;
            break;
          }
        }
        if (contained) {
          const position = new Position(1, 1);
          const message = `Index "${indexA.name}" is completely contained in index "${indexB.name}"`;
          issues.push(Issue.atPosition(obj.getFiles()[0], position, message, this.getMetadata().key, this.conf.severity));
        }
      }
    }

    return issues;
  }

}