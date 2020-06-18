import {AbstractObject} from "./_abstract_object";

export class GatewayVocabularyAnnotation extends AbstractObject {

  public getType(): string {
    return "IWVB";
  }

  public getAllowedNaming() {
    return {
      maxLength: 36,
      allowNamespace: false,
    };
  }
}
