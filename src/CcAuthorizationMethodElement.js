/* eslint-disable class-methods-use-this */
import { AuthorizationMethodElement } from '@advanced-rest-client/authorization';
import { factory, typeChangedSymbol, propagateChanges, changeCallback, renderCallback } from '@advanced-rest-client/authorization/src/AuthorizationMethodElement.js';
import { normalizeType } from '@advanced-rest-client/authorization/src/Utils.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@advanced-rest-client/date-time/date-time.js';
import { ClientCertificatesConsumerMixin } from './ClientCertificatesConsumerMixin.js';
import styles from './styles/CcAuthorizationMethod.js';
import { CcUiDataHelper } from './lib/CcUiDataHelper.js';

/** @typedef {import('@advanced-rest-client/authorization').AuthUiInit} AuthUiInit */
/** @typedef {import('./lib/ClientCertificate').default} ClientCertificate */

export const METHOD_CC = 'client certificate';

export default class CcAuthorizationMethodElement extends ClientCertificatesConsumerMixin(AuthorizationMethodElement) {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * The id of selected certificate.
       */
      selected: { type: String },
      /**
       * When set it renders `none` option in the list of certificates.
       */
      none: { type: Boolean },
      /**
       * When set it renders `import certificate` button.
       * When enabled the application must handle
       * `client-certificate-import` event dispatched by this element
       * to render some kind of UI to import a certificate.
       * The element does not have an UI to import certificates.
       *
       * The event bubbles and is cancelable.
       */
      importButton: { type: Boolean }
    };
  }

  constructor() {
    super();
    /** @type boolean */
    this.none = undefined;
    /** @type boolean */
    this.importButton = undefined;
    /** @type string */
    this.selected = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    this.type = METHOD_CC;
    this.setAttribute('type', METHOD_CC);
  }

  /**
   * Validates the form.
   *
   * @return {boolean} Validation result. Always true.
   */
  validate() {
    return true;
  }

  /**
   * A function called when `type` changed.
   * Note, that other properties may not be initialized just yet.
   *
   * @param {string} type Current value.
   */
  [typeChangedSymbol](type) {
    const normalized = normalizeType(type);
    if (normalized !== METHOD_CC) {
      throw new Error(`The type ${type} is unsupported by this element.`);
    }
    const init = /** @type AuthUiInit */ ({
      renderCallback: this[renderCallback],
      changeCallback: this[changeCallback],
      target: this,
      readOnly: this.readOnly,
      disabled: this.disabled,
      anypoint: this.compatibility,
      outlined: this.outlined,
      authorizing: this.authorizing,
    });
    this[factory] = CcUiDataHelper.setupClientCertificate(this, init);
    this[factory].defaults();
    this.requestUpdate();
  }

  /**
   * Propagates values from the UI factory to this element.
   * This is to synchronize user entered values with the element's state.
   */
  [propagateChanges]() {
    switch (normalizeType(this.type)) {
      case METHOD_CC: CcUiDataHelper.populateClientCertificate(this, /** @type ClientCertificate */ (this[factory])); break;
      default:
    }
  }
}
