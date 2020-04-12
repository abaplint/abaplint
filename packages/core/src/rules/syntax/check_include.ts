import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {IRegistry} from "../../_iregistry";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ABAPObject} from "../../objects/_abap_object";
import {IncludeGraph} from "../../utils/include_graph";

export class CheckIncludeConf extends BasicRuleConfig {
}

export class CheckInclude extends ABAPRule {

  private conf = new CheckIncludeConf();

  public getMetadata() {
    return {
      key: "check_include",
      title: "Check INCLUDEs",
      quickfix: false,
      shortDescription: `Checks INCLUDE statements`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckIncludeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: IRegistry, _obj: ABAPObject) {
    return new IncludeGraph(reg).getIssuesFile(file);
  }

}