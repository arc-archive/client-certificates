import { LitElement } from 'lit-element';
import { ClientCertificatesConsumerMixin } from '../index.js';

class TestElementSaved extends ClientCertificatesConsumerMixin(LitElement) {}
window.customElements.define('test-element', TestElementSaved);
