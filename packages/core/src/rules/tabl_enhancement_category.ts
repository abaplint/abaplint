import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {Table, EnhancementCategory} from "../objects";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Position} from "../position";

export class TABLEnhancementCategoryConf extends BasicRuleConfig {
}

export class TABLEnhancementCategory implements IRule {
  private conf = new TABLEnhancementCategoryConf();

  public getMetadata() {
    return {
      key: "tabl_enhancement_category",
      title: "TABL enhancement category must be set",
      shortDescription: `Checks that tables do not have the enhancement category 'not classified'`,
    };
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

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof Table)) {
      return [];
    }

    if (obj.getEnhancementCategory() === EnhancementCategory.NotClassified) {
      const position = new Position(1, 1);
      const issue = Issue.atPosition(
        obj.getFiles()[0],
        position,
        this.getDescription(obj.getName()),
        this.getMetadata().key,
        this.conf.severity);
      return [issue];
    }

    return [];
  }
}