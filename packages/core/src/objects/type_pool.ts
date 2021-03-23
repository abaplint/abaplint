import {ABAPObject} from "./_abap_object";
import {ABAPFile} from "../abap/abap_file";

export class TypePool extends ABAPObject {

  public getType(): string {
    return "TYPE";
  }

  public getSequencedFiles(): readonly ABAPFile[] {
    const main = this.getMainABAPFile();
    if (main === undefined) {
      return [];
    }
    return [main];
  }

  public getAllowedNaming() {
    return {
      maxLength: 5,
      allowNamespace: false,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}