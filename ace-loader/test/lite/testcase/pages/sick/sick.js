import router from '@system.router';
export default {
  data: {
    marginLeft: '77px',
    dizzinessColor: '#F5B041',
  },
  change() {
    router.replace({ uri: 'pages/music/music' });
  },
};
