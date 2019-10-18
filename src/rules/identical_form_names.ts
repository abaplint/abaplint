import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Registry} from "../registry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject} from "../objects/_abap_object";

/** Detects identically named forms. */
export class IdenticalFormNamesConf extends BasicRuleConfig {
}

export class IdenticalFormNames implements IRule {

  private conf = new IdenticalFormNamesConf();

  public getKey(): string {
    return "identical_form_names";
  }

  private getDescription(name: string): string {
    return "Identical FORM Names:" + name;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IdenticalFormNamesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const ret: Issue[] = [];
    const found: string[] = [];

    for (const file of obj.getABAPFiles()) {
      for (const form of file.getFormDefinitions()) {
        const name = form.getName().toUpperCase();
        if (found.indexOf(name) >= 0) {
          const message = this.getDescription(name) + " \"" + name + "\"";
          ret.push(new Issue({file, message, key: this.getKey(), start: form.getStart()}));
        } else {
          found.push(name);
        }
      }
    }

    return ret;
  }

}