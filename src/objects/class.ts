import {ABAPObject} from "./_abap_object";

export class Class extends ABAPObject {

  public isException(): boolean {
    for (let file of this.files) {
      if (file.getObjectName().match(/^zcx_.*$/i)) {
        return true;
      }
    }
    return false;
  }

  public getType(): string {
    return "CLAS";
  }

}