{
  "data": {
    "musics": [
      {
        "name": "Song1",
        "singer": "player1"
      },
      {
        "name": "Song2",
        "singer": "player2"
      },
      {
        "name": "Song3",
        "singer": "player3"
      },
      {
        "name": "Song4",
        "singer": "player4"
      },
      {
        "name": "Song5",
        "singer": "player5"
      },
      {
        "name": "Song6",
        "singer": "player6"
      },
      {
        "name": "Song7",
        "singer": "player7"
      },
      {
        "name": "Song8",
        "singer": "player8"
      }
    ]
  },
  "render": "function (vm) { var _vm = vm || this; var i18ns = []; i18ns.push( _vm.$t('strings.dizziness') ); return _c('div', {'staticClass' : [\"wrapper\"]} , [_l((function () {return _vm.musics}),function(value,$idx){return _c('div', {'staticClass' : [\"music-list-item\"]} , [_c('div', {'staticStyle' : {'height' : 400,'width' : 454,'flexDirection' : \"column\"}, } , [_c('text', {'attrs' : {'value' : function () {return _vm.$t('value.name')}},'staticClass' : [\"content\"]} ),_c('text', {'attrs' : {'value' : function () {return value.name}},'staticClass' : [\"content\"]} ),_c('text', {'attrs' : {'value' : i18ns[0]},'staticClass' : [\"content\"]} ),_c('text', {'attrs' : {'value' : function () {return value.singer}},'staticClass' : [\"content\"]} )] )] )})] ) }",
  "styleSheet": {
    "classSelectors": {
      "content": {
        "fontSize": 30,
        "height": 50,
        "textAlign": "center",
        "width": 454
      },
      "music-list-item": {
        "height": 300,
        "width": 454
      },
      "wrapper": {
        "flexDirection": "column",
        "height": 3000,
        "width": 454
      }
    }
  }
}