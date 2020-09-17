import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject} from "../objects/_abap_object";

export class IdenticalFormNamesConf extends BasicRuleConfig {
}

export class IdenticalFormNames implements IRule {

  private conf = new IdenticalFormNamesConf();

  public getMetadata() {
    return {
      key: "identical_form_names",
      title: "Identical FORM names",
      shortDescription: `Detects identically named FORMs`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IdenticalFormNamesConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const ret: Issue[] = [];
    const found: string[] = [];

    for (const file of obj.getABAPFiles()) {
      for (const form of file.getInfo().listFormDefinitions()) {
        const name = form.name.toUpperCase();
        if (found.indexOf(name) >= 0) {
          const message = "Identical FORM Names: \"" + name + "\"";
          const issue = Issue.atIdentifier(form.identifier, message, this.getMetadata().key, this.conf.severity);
          ret.push(issue);
        } else {
          found.push(name);
        }
      }
    }

    return ret;
  }

}