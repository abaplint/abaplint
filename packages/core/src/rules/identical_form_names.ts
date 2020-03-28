import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject} from "../objects/_abap_object";

/** Detects identically named FORMs */
export class IdenticalFormNamesConf extends BasicRuleConfig {
}

export class IdenticalFormNames implements IRule {

  private conf = new IdenticalFormNamesConf();

  public getKey(): string {
    return "identical_form_names";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IdenticalFormNamesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: IRegistry): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const ret: Issue[] = [];
    const found: string[] = [];

    for (const file of obj.getABAPFiles()) {
      for (const form of file.getFormDefinitions()) {
        const name = form.getName().toUpperCase();
        if (found.indexOf(name) >= 0) {
          const message = "Identical FORM Names: \"" + name + "\"";
          const issue = Issue.atIdentifier(form, message, this.getKey());
          ret.push(issue);
        } else {
          found.push(name);
        }
      }
    }

    return ret;
  }

}