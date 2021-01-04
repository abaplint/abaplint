import {ABAPFile, Issue, Version} from "..";
import {FunctionName} from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";


export type Recommendations = {name: string, replace: string, from?: Version;};

export class FunctionModuleRecommendationsConf extends BasicRuleConfig {

  /** Tuple of Function Module Name to be replaced, the recommended alternative and
   * the version from which the recommendation is valid.*/
  public recommendations: Recommendations[] = [
    {name: "SUBST_GET_FILE_LIST", replace: "see note 1686357"},
    {name: "ROUND", replace: "use built in function: round()"},
    {name: "SO_NEW_DOCUMENT_ATT_SEND_API1", replace: "use CL_BCS"},
    {name: "ECATT_CONV_XSTRING_TO_STRING", replace: "use CL_BINARY_CONVERT"},
    {name: "SCMS_STRING_TO_XSTRING", replace: "use CL_BINARY_CONVERT"},
    {name: "JOB_CREATE", replace: "use CL_BP_ABAP_JOB"},
    {name: "JOB_SUBMIT", replace: "use CL_BP_ABAP_JOB"},
    {name: "GUI_DOWNLOAD", replace: "use CL_GUI_FRONTEND_SERVICES"},
    {name: "GUI_UPLOAD", replace: "use CL_GUI_FRONTEND_SERVICES"},
    {name: "WS_FILENAME_GET", replace: "use CL_GUI_FRONTEND_SERVICES"},
    {name: "F4_FILENAME", replace: "use CL_GUI_FRONTEND_SERVICES"},
    {name: "SAPGUI_PROGRESS_INDICATOR", replace: "use CL_PROGRESS_INDICATOR"},
    {name: "GUID_CREATE", replace: "use CL_SYSTEM_UUID"},
    {name: "SSFC_BASE64_DECODE", replace: "use class CL_HTTP_UTILITY methods"},
    {name: "SSFC_BASE64_ENCODE", replace: "use class CL_HTTP_UTILITY methods"},
    {name: "SCMS_BASE64_DECODE_STR", replace: "use class CL_HTTP_UTILITY methods"},
    {name: "POPUP_TO_DECIDE", replace: "use POPUP_TO_CONFIRM"},
    {name: "REUSE_ALV_GRID_DISPLAY", replace: "use CL_SALV_TABLE=>FACTORY or CL_GUI_ALV_GRID"},
    {name: "CALCULATE_HASH_FOR_RAW", replace: "use CL_ABAP_HMAC"},
    {name: "FUNCTION_EXISTS", replace: "surround with try-catch CX_SY_DYN_CALL_ILLEGAL_METHOD instead"},

  ];
}

export class FunctionModuleRecommendations extends ABAPRule {

  private conf = new FunctionModuleRecommendationsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "function_module_recommendations",
      title: "Function Module Recommendations",
      shortDescription: `Function Module Recommendations`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/53/`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FunctionModuleRecommendationsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    if (!this.conf.recommendations) {
      return issues;
    }
    const configVersion = this.reg.getConfig().getVersion();

    for (const exNode of file.getStructure()?.findAllExpressions(FunctionName) || []) {
      const token = exNode.getFirstToken();
      let funcName = token.getStr().toUpperCase();
      // only check constant FM names
      if (!funcName.startsWith("'")) {
        continue;
      }
      // remove leading and trailing single quote
      funcName = funcName.slice(1, funcName.length - 1);
      const index = this.conf.recommendations.findIndex(
        i => i.name.toUpperCase() === funcName && (i.from === undefined || configVersion >= i.from));
      if (index >= 0) {
        issues.push(Issue.atToken(file, token, this.getMessage(index), this.getMetadata().key, this.conf.severity));
      }
    }
    return issues;
  }


  private getMessage(index: number) {
    return `Recommendation: Replace Function ${this.conf.recommendations[index].name} with: ${this.conf.recommendations[index].replace}`;
  }

}