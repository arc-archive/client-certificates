import { ARCCertificateIndex } from '@advanced-rest-client/arc-models';
import { CCAuthorization } from '@advanced-rest-client/arc-types/src/authorization/Authorization';
import { AuthorizationMethodElement } from '@advanced-rest-client/authorization';
import { CSSResult, TemplateResult } from 'lit-element';
import { ClientCertificatesConsumerMixin } from './ClientCertificatesConsumerMixin';

export declare const METHOD_CC: string;
export declare const defaultItemTemplate: unique symbol;
export declare const certItemTemplate: unique symbol;
export declare const emptyTemplate: unique symbol;
export declare const contentTemplate: unique symbol;
export declare const dateTimeTemplate: unique symbol;
export declare const importTemplate: unique symbol;
export declare const selectedHandler: unique symbol;
export declare const importHandler: unique symbol;

export declare class CcAuthorizationMethodElement extends ClientCertificatesConsumerMixin(AuthorizationMethodElement) {
  static get styles(): CSSResult;
  /**
   * The id of selected certificate.
   * @attribute
   */
  selected: string;
  /**
   * When set it renders `none` option in the list of certificates.
   * @attribute
   */
  none: boolean;
  /**
   * When set it renders `import certificate` button. Handle ARC navigation event to navigate to the import panel.
   * @attribute
   */
  importButton: boolean;
  /**
   * Validates the form.
   *
   * @returns Validation result. Always true.
   */
  validate(): boolean;

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @returns User provided data
   */
  serialize(): CCAuthorization;

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param settings Previously serialized values.
   */
  restore(settings: CCAuthorization): void;
  [selectedHandler](e: CustomEvent): void;

  [importHandler](): void;

  render(): TemplateResult;

  [contentTemplate](): TemplateResult;

  [emptyTemplate](): TemplateResult;

  [defaultItemTemplate](): TemplateResult|string;

  /**
   * @param item The item to render
   * @returns The template for the dropdown item.
   */
  [certItemTemplate](item: ARCCertificateIndex): TemplateResult;
  /**
   * @param created The certificate created time.
   * @returns The template for the cert time element.
   */
  [dateTimeTemplate](created: number): TemplateResult;

  [importTemplate](): TemplateResult|string;
}
