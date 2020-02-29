import {xmlToArray} from "../../xml_utils";

export class FunctionModuleDefinition {
  private name: string;
  private parameters: string[];

  public constructor(data: any) {
    this.parse(data);
  }

  public getParameters() {
    return this.parameters;
  }

  public getName(): string {
    return this.name;
  }

  private parse(data: any) {
    this.name = data.FUNCNAME._text;
    this.parameters = [];

    if (data.IMPORT) {
      for (const param of xmlToArray(data.IMPORT.RSIMP)) {
        this.parameters.push(param.PARAMETER._text);
      }
    }

    if (data.CHANGING) {
      for (const param of xmlToArray(data.CHANGING.RSCHA)) {
        this.parameters.push(param.PARAMETER._text);
      }
    }

    if (data.EXPORT) {
      for (const param of xmlToArray(data.EXPORT.RSEXP)) {
        this.parameters.push(param.PARAMETER._text);
      }
    }

    if (data.TABLES) {
      for (const param of xmlToArray(data.TABLES.RSTBL)) {
        this.parameters.push(param.PARAMETER._text);
      }
    }

  }

}