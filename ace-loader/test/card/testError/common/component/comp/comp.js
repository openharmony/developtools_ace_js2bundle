export default {
  props:{
    title: {
      default: "title"
    }
  },
  data: {
    show: false,
  },
  textClicked () {
    this.$emit('textClicked');
    this.show = !this.show;
  },
}
