import {AbstractObject} from "./_abstract_object";

export class CustomizingImgActivity extends AbstractObject {

  public getType(): string {
    return "CUS0";
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }
}
