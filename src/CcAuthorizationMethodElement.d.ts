import { AuthorizationMethodElement } from '@advanced-rest-client/authorization';
import { CSSResult } from 'lit-element';
import { ClientCertificatesConsumerMixin } from './ClientCertificatesConsumerMixin';

export declare const METHOD_CC: string;

/**
 * @deprecated Use `@advanced-rest-client/app` instead.
 */
export default class CcAuthorizationMethodElement extends ClientCertificatesConsumerMixin(AuthorizationMethodElement) {
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
}
