import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {Table, EnhancementCategory} from "../objects";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Position} from "../position";

/** Checks that tables do not have the enhancement category 'not classified' */
export class TABLEnhancementCategoryConf extends BasicRuleConfig {
}

export class TABLEnhancementCategory implements IRule {
  private conf = new TABLEnhancementCategoryConf();

  public getKey(): string {
    return "tabl_enhancement_category";
  }

  private getDescription(name: string): string {
    return "TABL enhancement category not classified in " + name;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: TABLEnhancementCategoryConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    if (!(obj instanceof Table)) {
      return [];
    }

    if (obj.getEnhancementCategory() === EnhancementCategory.NotClassified) {
      const position = new Position(1, 1);
      const issue = Issue.atPosition(obj.getFiles()[0], position, this.getDescription(obj.getName()), this.getKey());
      return [issue];
    }

    return [];
  }
}