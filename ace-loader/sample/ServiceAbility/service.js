export default {
  onStart(want) {
    console.info('ServiceAbility onStart');
  },
  onStop() {
    console.info('ServiceAbility onStop');
  },
  onConnect(want) {
    console.info('ServiceAbility onConnect');
  },
  onReconnect(want) {
    console.info('ServiceAbility onReconnect');
  },
  onDisconnect() {
    console.info('ServiceAbility onDisconnect');
  },
  onCommand(want, restart, startId) {
    console.info('ServiceAbility onCommand');
  },
  onRemoteRequest(code, data, reply) {
    console.info('ServiceAbility onRemoteRequest');
    return true;
  }
};