{
  "@app-component/event": {
    "_descriptor": {},
    "data": {},
    "template": {
      "attr": {
        "debugLine": "pages/event/event:1"
      },
      "children": [
        {
          "attr": {
            "debugLine": "pages/event/event:3"
          },
          "events": {
            "click": "test"
          },
          "type": "div"
        },
        {
          "attr": {
            "debugLine": "pages/event/event:6"
          },
          "events": {
            "click": "function (evt) {this.test(this.value,evt)}"
          },
          "type": "div"
        },
        {
          "attr": {
            "debugLine": "pages/event/event:9"
          },
          "events": {
            "click": "function (evt) {this.test(this.value,this.time,evt)}"
          },
          "type": "div"
        },
        {
          "attr": {
            "debugLine": "pages/event/event:12"
          },
          "events": {
            "click": "test"
          },
          "type": "div"
        },
        {
          "attr": {
            "debugLine": "pages/event/event:15"
          },
          "events": {
            "click": "function (evt) {this.test(this.value,evt)}"
          },
          "type": "div"
        },
        {
          "attr": {
            "debugLine": "pages/event/event:18"
          },
          "events": {
            "click": "function (evt) {this.test(this.value,this.time,evt)}"
          },
          "type": "div"
        },
        {
          "type": "input",
          "attr": {
            "debugLine": "pages/event/event:21"
          },
          "events": {
            "click": "function (evt) {this.handleInput('(',evt)}"
          }
        },
        {
          "type": "input",
          "attr": {
            "debugLine": "pages/event/event:24"
          },
          "events": {
            "click": "function (evt) {this.handleInput(')',evt)}"
          }
        },
        {
          "type": "input",
          "attr": {
            "debugLine": "pages/event/event:27"
          },
          "events": {
            "click": "function (evt) {this.handleInput('(',this.value,this.time,evt)}"
          }
        },
        {
          "attr": {
            "debugLine": "pages/event/event:30"
          },
          "type": "div",
          "onBubbleEvents": {
            "touchstart": "test1"
          }
        },
        {
          "attr": {
            "debugLine": "pages/event/event:31"
          },
          "type": "div",
          "onBubbleEvents": {
            "touchstart": "test2"
          }
        },
        {
          "attr": {
            "debugLine": "pages/event/event:32"
          },
          "type": "div",
          "onBubbleEvents": {
            "touchstart": "test3"
          }
        },
        {
          "attr": {
            "debugLine": "pages/event/event:33"
          },
          "type": "div",
          "catchBubbleEvents": {
            "touchstart": "test4"
          }
        },
        {
          "attr": {
            "debugLine": "pages/event/event:34"
          },
          "type": "div",
          "onBubbleEvents": {
            "touchstart": "test5"
          }
        },
        {
          "attr": {
            "debugLine": "pages/event/event:35"
          },
          "type": "div",
          "onBubbleEvents": {
            "touchstart": "test6"
          }
        },
        {
          "attr": {
            "debugLine": "pages/event/event:36"
          },
          "type": "div",
          "catchBubbleEvents": {
            "touchstart": "test7"
          }
        },
        {
          "attr": {
            "debugLine": "pages/event/event:37"
          },
          "type": "div",
          "onCaptureEvents": {
            "touchstart": "test8"
          }
        },
        {
          "attr": {
            "debugLine": "pages/event/event:38"
          },
          "type": "div",
          "catchCaptureEvents": {
            "touchstart": "test9"
          }
        }
      ],
      "type": "div"
    }
  }
}