# frameV
Framed Visuals: collaborative generative art.

## Adding a work to frameV
1. Create your repo
   * Your repo should have an `index.html` file in the root. An example of a frameV repo can be found here: https://github.com/2xAA/frame-v-squares
   * You can use any method to create animations (SVG, Canvas2D, WebGL etc) but be wary that not everyone's devices will be the same, so performance counts.
   * frameV will make the root of your repo avilable at `framev.vcync.gl/static/` when your work is displayed. However, if you have set the `dir` key on your work entry, that directory will be available at `/static` instead.
2. Fork this repo
3. Add a work entry in `works.json` (see the [Work entries](#work-entries) section below for more info)
4. Create a PR back to this repo

## Work entries

The `works.json` file contains an array of work entries in the following format:

```javascript
{
  "author": "2xAA",
  "title": "Squares",
  "repo": "https://github.com/2xAA/frame-v-squares",
  "dir": "dist" // (optional)
}
```

### Dir

The `dir` key is optional and is used to specify where in *your* repo your index.html is.

An example of a working repo with the `dir` key specified in the work entry can be found here: https://github.com/2xAA/framev-unicode-wave

## Requirements for running the server

* node.js >= 12

## Running the server
1. Clone this repo
2. `yarn`
3. `node index.js`
