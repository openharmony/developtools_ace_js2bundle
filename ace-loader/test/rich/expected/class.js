{
  "@app-component/class": {
    "_descriptor": {},
    "data": {},
    "template": {
      "type": "div",
        "attr": {
          "className": "container",
          "debugLine": "pages/class/class:1"
        },
      "classList": [
        "container"
      ],
        "children": [
          {
            "type": "div",
            "attr": {
              "className": "title",
              "debugLine": "pages/class/class:3",
              "value": "class_test1"
            },
            "classList": [
              "title"
            ]
          },
          {
            "type": "div",
            "attr": {
              "className": "title table",
              "debugLine": "pages/class/class:6",
              "value": "class_test2"
            },
            "classList": [
              "title",
              "table"
            ]
          },
          {
            "type": "div",
            "attr": {
              "className": "{{flag ? 'item' : 'item-selected'}}",
              "debugLine": "pages/class/class:9",
              "value": "class_test3"
            },
            "classList": "function () {return [this.flag?'item':'item-selected']}"
          },
          {
            "type": "div",
            "attr": {
              "className": "{{a}}    {{c}}",
              "debugLine": "pages/class/class:12",
              "value": "class_test4"
            },
            "classList": "function () {return [this.a, this.c]}"
          },
          {
            "type": "div",
            "attr": {
              "className": "{{$idx}}{{d}} + {{$item.id}} aa",
              "debugLine": "pages/class/class:15",
              "value": "class_test5"
            },
            "classList": "function () {return [this.$idx+this.d, '+', this.$item.id, 'aa']}"
          }
        ]
    }
  }
}