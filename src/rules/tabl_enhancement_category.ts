import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {Table, EnhancementCategory} from "../objects";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Position} from "../position";

export class TABLEnhancementCategoryConf extends BasicRuleConfig {
}

export class TABLEnhancementCategory implements IRule {
  private conf = new TABLEnhancementCategoryConf();

  public getKey(): string {
    return "tabl_enhancement_category";
  }

  public getDescription(): string {
    return "TABL enhancement category not classified";
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
      return [new Issue({file: obj.getFiles()[0],
        message: this.getDescription(), key: this.getKey(), start: new Position(1, 1)})];
    }

    return [];
  }
}