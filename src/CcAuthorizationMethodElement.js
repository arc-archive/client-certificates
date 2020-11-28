/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { AuthorizationMethod } from '@advanced-rest-client/authorization-method/src/AuthorizationMethod.js';
import { notifyChange } from '@advanced-rest-client/authorization-method/src/Utils.js';
import { ArcNavigationEvents, TelemetryEvents } from '@advanced-rest-client/arc-events';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@advanced-rest-client/date-time/date-time.js';
import { ClientCertificatesConsumerMixin } from './ClientCertificatesConsumerMixin.js';
import styles from './styles/CcAuthorizationMethod.js';

/** @typedef {import('@advanced-rest-client/arc-types').Authorization.CCAuthorization} CCAuthorization */
/** @typedef {import('@advanced-rest-client/arc-models').ARCCertificateIndex} ARCCertificateIndex */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const METHOD_CC = 'client certificate';
export const defaultItemTemplate = Symbol('defaultItemTemplate');
export const certItemTemplate = Symbol('certItemTemplate');
export const emptyTemplate = Symbol('emptyTemplate');
export const contentTemplate = Symbol('contentTemplate');
export const dateTimeTemplate = Symbol('dateTimeTemplate');
export const importTemplate = Symbol('importTemplate');
export const selectedHandler = Symbol('selectedHandler');
export const importHandler = Symbol('importHandler');

export class CcAuthorizationMethodElement extends ClientCertificatesConsumerMixin(AuthorizationMethod) {
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

    this.none = false;
    this.importButton = false;
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
   * Creates a settings object with user provided data for current method.
   *
   * @return {CCAuthorization} User provided data
   */
  serialize() {
    const { selected } = this;
    if (!selected || selected === 'none') {
      // @ts-ignore
      return {};
    }
    return {
      id: this.selected
    };
  }

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param {CCAuthorization} settings Previously serialized values.
   */
  restore(settings) {
    if (!settings) {
      this.selected = undefined;
      return;
    }
    this.selected = settings.id;
  }

  [selectedHandler](e) {
    const { value } = e.detail;
    this.selected = value;
    notifyChange(this);

    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'Authorization',
      label: 'selected-certificate'
    });
  }

  [importHandler]() {
    ArcNavigationEvents.navigate(this, 'client-certificate-import');
    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'Authorization',
      label: 'navigate-import'
    });
  }

  render() {
    const { hasItems } = this;
    return html`
    ${this[importTemplate]()}
    ${hasItems ? this[contentTemplate]() : this[emptyTemplate]()}`;
  }

  [contentTemplate]() {
    const { items, selected } = this;
    return html`
    <div class="list">
      <anypoint-radio-group
        attrForSelected="data-id"
        .selected="${selected}"
        @selected-changed="${this[selectedHandler]}"
      >
        ${this[defaultItemTemplate]()}
        ${items.map((item) => this[certItemTemplate](item))}
      </anypoint-radio-group>
    </div>`;
  }

  [emptyTemplate]() {
    return html`<p class="empty-screen">There are no certificates installed in this application.</p>`;
  }

  [defaultItemTemplate]() {
    const { none } = this;
    if (!none) {
      return '';
    }
    return html`<anypoint-radio-button data-id="none" class="default">None</anypoint-radio-button>`;
  }

  /**
   * @param {ARCCertificateIndex} item The item to render
   * @returns {TemplateResult} The template for the dropdown item.
   */
  [certItemTemplate](item) {
    return html`
    <anypoint-radio-button data-id="${item._id}">
      <div class="cert-meta">
        <span class="name">${item.name}</span>
        <span class="created">Added: ${this[dateTimeTemplate](item.created)}</span>
      </div>
    </anypoint-radio-button>`;
  }

  /**
   * @param {number} created The certificate created time.
   * @returns {TemplateResult} The template for the cert time element.
   */
  [dateTimeTemplate](created) {
    return html`<date-time
      .date="${created}"
      year="numeric"
      month="numeric"
      day="numeric"
      hour="numeric"
      minute="numeric"
    ></date-time>`;
  }

  [importTemplate]() {
    const { importButton } = this;
    if (!importButton) {
      return '';
    }
    return html`
    <anypoint-button
      title="Opens a dialog that allows to import client certificate"
      aria-label="Activate to open import certificate dialog"
      @click="${this[importHandler]}"
    >Import certificate</anypoint-button>`;
  }
}
