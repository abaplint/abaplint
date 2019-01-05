import {xmlToArray} from "../../xml_utils";

export class FunctionModuleDefinition {
  private name: string;
  private parameters: string[];

  constructor(data: any) {
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
      for (const imp of xmlToArray(data.IMPORT.RSIMP)) {
        this.parameters.push(imp.PARAMETER._text);
      }
    }

    if (data.CHANGING) {
      for (const imp of xmlToArray(data.CHANGING.RSCHA)) {
        this.parameters.push(imp.PARAMETER._text);
      }
    }

    if (data.EXPORT) {
      for (const imp of xmlToArray(data.EXPORT.RSEXP)) {
        this.parameters.push(imp.PARAMETER._text);
      }
    }

    if (data.TABLES) {
      for (const imp of xmlToArray(data.TABLES.RSTBL)) {
        this.parameters.push(imp.PARAMETER._text);
      }
    }

  }

}