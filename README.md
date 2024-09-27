# midpilot_script
Script tag for integrating midpilot


## Development

To get started.

1. create a branch with `git checkout -b <your-branch-name>`. Push the branch to the repo with `git push origin <your-branch-name>`.

2. run `npm install`.

3. Code in `src` is developed with React.

4. To build:
```
npx webpack
```

## Local Testing

1. Run `npx webpack` to build the project.

2. Then, open `test_dev.html` in your browser. This references the local `dist/midpilot.bundle.js` file.

3. To test on the production environment, open `test_prod.html`. This references the production `midpilot.bundle.js` file. 

## Deployment

1. To deploy a new version after testing, first push a commit to your branch.

2. Then, create a new PR to merge main into the target branch (likely `production`).

3. Generate an updated `midpilot.bundle.js` with `npx webpack`

4. Drag and drop `midpilot.bundle.js` to [GCP bucket](https://console.cloud.google.com/storage/browser/midpilot-script-1;tab=objects?project=midpilot-call-server-434813&supportedpurview=project&prefix=&forceOnObjectsSortingFiltering=false). 
4. a) Click Upload
4. b) Click Upload Files
4. c) Click Choose Files
4. d) Select `midpilot.bundle.js`
4. e) When prompted with "Resolve Object Conflict" select "Overwrite Object" and click "Continue Uploading"

5. Test file with `test_prod.html` (see Local Testing). Make sure to hard refresh to clear cache, which will trigger a request for the newest file from our CDN. Otherwise, acquiring a new version can take up to 60 minutes.