import {Issue} from "../issue";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {IRegistry} from "../_iregistry";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPObject} from "../objects/_abap_object";

/** Checks for untyped FORM parameters */
export class TypeFormParametersConf extends BasicRuleConfig {
}

export class TypeFormParameters extends ABAPRule {

  private conf = new TypeFormParametersConf();

  public getKey(): string {
    return "type_form_parameters";
  }

  private getDescription(parameterName: string): string {
    return "Add TYPE for FORM parameter \"" + parameterName + "\"";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: TypeFormParametersConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: IRegistry, obj: ABAPObject) {
    const ret: Issue[] = [];

    const stru = file.getStructure();
    if (obj instanceof Class || stru === undefined) {
      return ret;
    }

    for (const formparam of stru.findAllExpressions(Expressions.FormParam)) {
      if (formparam.findFirstExpression(Expressions.FormParamType) === undefined) {
        const token = formparam.getFirstToken();
        const issue = Issue.atToken(file, token, this.getDescription(token.getStr()), this.getKey());
        ret.push(issue);
      }
    }

    return ret;
  }

}
