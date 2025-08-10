(function() {
  globalThis.Evented = Opti.Evented;
  globalThis.Thread;
  globalThis.StaticThread;

  EventTarget.prototype.addBoundListener = Opti.addBoundListener;
  EventTarget.prototype.addEventListeners = Opti.addEventListeners;
  EventTarget.prototype.delegateEventListener = Opti.delegateEventListener;
})();