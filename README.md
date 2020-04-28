# frameV
Framed Visuals: collaborative generative art.

## Adding a work to frameV
1. Create your repo
   * Your repo should have an `index.html` file in the root. An example of a frameV repo can be found here: https://github.com/2xAA/frame-v-squares
   * You can use any method to create animations (SVG, Canvas2D, WebGL etc) but be weary that not everyone's devices will be the same, so performance counts.
2. Fork this repo
3. Add an entry in `works.json`
```JavaScript
{
  "author": "2xAA",
  "title": "Squares",
  "repo": "https://github.com/2xAA/frame-v-squares"
}
```
4. Create a PR back to this repo

## Requirements for running the server
* node.js >= 12

## Running the server
1. Clone this repo
2. `yarn`
3. `node index.js`
