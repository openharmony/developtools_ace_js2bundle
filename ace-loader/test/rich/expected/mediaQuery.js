{
  "@app-component/mediaQuery": {
    "_descriptor": {},
    "data": {},
    "template": {
      "type": "div",
      "attr": {
        "debugLine": "pages/mediaQuery/mediaQuery:1",
        "value": "mediaQuery_test"
      }
    },
    "style": {
      "@MEDIA": [
        {
          "condition": "screen and (min-width: 600) and (max-width: 1200)",
          ".header": {
            "width": "100%",
            "height": "60px",
            "fontSize": "16px",
            "alignItems": "center",
            "justifyContent": "center"
          },
          ".footer": {
            "width": "100%",
            "height": "40px",
            "alignItems": "center"
          }
        },
        {
          "condition": "(device-type: tv)",
          ".page-title-wrap": {
            "paddingTop": "50px",
            "paddingBottom": "80px",
            "justifyContent": "center"
          },
          ".page-title": {
            "paddingTop": "30px",
            "paddingBottom": "30px",
            "paddingLeft": "40px",
            "paddingRight": "40px",
            "borderTopColor": "#bbbbbb",
            "borderRightColor": "#bbbbbb",
            "borderBottomColor": "#bbbbbb",
            "borderLeftColor": "#bbbbbb",
            "color": "#bbbbbb",
            "borderBottomWidth": "2px"
          },
          ".btn": {
            "height": "80px",
            "textAlign": "center",
            "borderBottomLeftRadius": "5px",
            "borderBottomRightRadius": "5px",
            "borderTopLeftRadius": "5px",
            "borderTopRightRadius": "5px",
            "marginRight": "60px",
            "marginLeft": "60px",
            "marginBottom": "50px",
            "color": "#ffffff",
            "fontSize": "30px",
            "backgroundColor": "#0faeff"
          },
          ".container": {
            "width": "500px",
            "height": "500px",
            "backgroundColor": "#fa8072"
          },
          ".title": {
            "fontSize": "16px",
            "color": "#333333",
            "alignItems": "center"
          },
          ".button": {
            "paddingTop": "50px",
            "fontSize": "16px",
            "color": "#666666",
            "alignItems": "center",
            "justifyContent": "center"
          }
        }
      ]
    }
  }
}