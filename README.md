# Web App

**IMPORTANT: dependencies for this repositories are not kept updated and may contain security vulnerabilities.**

## Intro
Front-end web app used in the ***[JoinUp](https://www.joinup.nu)*** App.<br><br>
Provides an interactive map allowing users to share their location with friends and set a meetup point.
<br><br>
Team website: [Core 55](https://core55.github.io/)

## Requirements
* node
* npm

## Technology
* **View Layer**: [Vue.js][0.5]
* **Routing**: [vue-router][1]
* **Server communication**: [vue-resource][2]
* **Build Tool**: Webpack + [vue-loader][3]
* **Design Framework**: [element-UI][4]
* **Other Core Libraries**: [googleMaps][5]

[0.5]: https://vuejs.org/
[1]: https://github.com/vuejs/vue-router
[2]: https://github.com/pagekit/vue-resource
[3]: https://github.com/vuejs/vue-loader
[4]: http://element.eleme.io/
[5]: https://developers.google.com/maps/documentation/javascript/

## Installation
1. Clone with SSH: `git clone git@gits-15.sys.kth.se:core55/web.git`
2. Rename the `config/dotenv.example.js` to `config/dotenv.js`
3. Make sure to add your own `googleMaps API key` and specify the address of the `REST API` to `config/dotenv.js`

```javascript
module.exports = {
    GOOGLE_MAP_KEY: '"TOKEN_HERE"',
    API_URL: '"API_HERE"'
}
```
5. Run `npm install` to install the dependencies
6. Enter `npm run dev` to start up a local server on `port :8080` by default
