### Using a Google Account to login via Protractor

End-to-end tests are possible, even with the Google authentication implemented on your application. It seems intuitive that it should be against Google’s terms of service to use automated software to log-in and do things gated behind the authentication. We were not able to find evidence to support this, though an absence of evidence does NOT prove anything. However, there are two additional things that lead us to believe this is allowed.

- There are plenty of people using automated software to login. 
- On the GitHub forum, [a Google employee responds to users who are trying to implement something similar to this.](https://github.com/googleapis/google-auth-library-nodejs/issues/225) He basically uses puppeteer (which is similar to Protractor) [to type a user and password (from a hidden json file) into the Google sign-in.](https://github.com/googleapis/google-auth-library-nodejs/pull/265/commits/6ac5d70c63ecc9ef22879fc7065671e9a436fb29#diff-5bf166de4727438cac7ca358547c5212R30)  

The test files need access to the test account’s (DO NOT USE ANY PERSON'S REAL GOOGLE ACCOUNT AS A TEST ACCOUNT) username and password to log-in. These need to be sent to the appropriate input fields on the Google log-in page. **DO NOT PLACE YOUR USERNAME AND PASSWORD INTO THE CODE!** Instead, you should have these inside a seperate file. **Add this file to your gitIgnore!** If you accidentally push this file up to your repo, your credentials are now out there for the world to see. Even if you delete that from the repo, the commit history will still have the file and its contents to show. You may wish to make this a JSON file to match our exmample. We put the file directly into our e2e test directory and it looks like this:

#### `googleSecrets.json`
```
{
  "username": "ourTestGoogleUserName",
  "password": "thisIsOurTestUsersExamplePassWord"
}
```

Now that you've created a file containing your test user's credentials, we will walk through the process that our e2e tests use to login via Google on our app. It may be helpful to have the actual files open while you read this documentation (they are all inside client/e2e). For your sake, each code block in this documentation will be introduced with the file name.


Most of the work is performed by two methods inside of our `ride-list.po.ts` test file. There are two important methods to know about: 

1. get_username_and_password()
2. logIn()

First, let's take a look at get_username_and_password().

#### `ride-list.po.ts (get_username_and_password)`
```javascript

let fs = require('fs');
let secretObject;

let username = '';
let password = '';

.....

export class RidePage {

  get_username_and_password(): void {

    fs.readFile('./e2e/googleSecrets.json', function read(err, data) {
      if (err) {
        throw err;
      }

      secretObject = data;
      let secretJSON = JSON.parse( secretObject.toString() );
      username = secretJSON['username'];
      password = secretJSON['password'];
    });

  };
  ......
  
```

There's alot happening here. First, notice the 'let' variables declared before the export class block. The 'fs' library allows us to get the information we need from our .json file. We also declared a 'secretObject' (which will be used soon), as well as 'username' and 'password'... (can you guess what we're using those for?)

Going into the export class block, we have our first method 'get_username_and_password()'. It uses 'fs' immediately to access the file containing our login information. The readFile method takes two arguments: The first is the *directory containing the credentials file* (may be different in your case), and the second argument is a function to execute on the 'data' retrieved from the file. 

#### `ride-list.po.ts (get_username_and_password)`
```javascript

secretObject = data;
      let secretJSON = JSON.parse( secretObject.toString() );
      username = secretJSON['username'];
      password = secretJSON['password'];

```

Inside THAT function, we assign the returned data to 'secretObject', and then use it to create 'secretJSON'. From there, we assign value to our declared variables from before the export class block. 

At this point we have our username and password ready to be used by the logIn() function.

#### `ride-list.po.ts (logIn)`
```javascript

logIn(): void {
  
    this.get_username_and_password();
    
    browser.get('/');
    this.click("signIn");
    
    let handlesPromise = browser.driver.getAllWindowHandles();
    
    handlesPromise.then(function(handles){
      
      let signInHandle = handles[1];
      browser.driver.switchTo().window(signInHandle);
      
      browser.waitForAngularEnabled(false);
      
      element(by.id("identifierId")).sendKeys(username);
      browser.actions().sendKeys(Key.ENTER).perform();
      
      element(by.name("password")).sendKeys(password);
      browser.actions().sendKeys(Key.ENTER).perform();
      
      browser.driver.switchTo().window(handles[0]);
      
      browser.driver.sleep(1000);
      
      }


```

Once again, there is alot happening. Let's break it down. 

##### `ride-list.po.ts (logIn)`
```javascript
...
this.get_username_and_password();
    
    browser.get('/');
    this.click("signIn");
    ...
```
Notice that the previously described function get_username_and_password() is called within *this* function. The next thing is browser.get('/') which just navigates Protractor to the home page, where the Google sign-in button is located. 

We then call this.click("signIn"). You might not have this function in your corresponding po.ts test file. Feel free to 'steal' this function from our ride-list.po.ts file. Basically this function just highlights the button being pressed (in our case, it's a button with the id of "signIn"), so you get some helpful feedback about what the test code is doing while you watch the test. 

If you don't have this function, an alternative to this line of code is to use:

```javascript
element(by.id("signIn")).click()
```

Moving forward now...

#### `ride-list.po.ts (logIn)`
```javascript
...
let handlesPromise = browser.driver.getAllWindowHandles();
    
    handlesPromise.then(function(handles){ 
      let signInHandle = handles[1];
            browser.driver.switchTo().window(signInHandle);
            ...
```

Clicking the Google sign-in button SHOULD open a separate window for you to enter your username and password. The problem is that our e2e test is focused on the first window. We can change that with browser.driver.getAllWindowHandles(). It returns a Promise of all the windows that the test has opened, and the sign-in window should be handles[1]. We then call switchTo.window(signInHandle) to focus the test on the new window.

*Note: If your Google sign-in is NOT opening a popup window, but redirecting the main window instead, you can change this (if you want). The gapi.auth.init method can take a configuration parameter called 'ux_mode'. Without explicitly specifying this parameter, the default value is 'popup'. You can change this using "ux_mode" = "redirect". If you're using redirect, just remove any code that has "browser.driver.switchTo()."*

The next thing is small but very important:

#### `ride-list.po.ts (logIn)`
```javascript
...
    browser.waitForAngularEnabled(false);
...
```

When the e2e navigates away to something that isn't Angular related, it stops itself and breaks. We can prevent this behavior with the above line of code. This needs to be done before the test interacts with anything foreign.

Now we can start interacting with the sign-in window.
#### `ride-list.po.ts (logIn)`
```javascript
...
   element(by.id("identifierId")).sendKeys(username);
   browser.actions().sendKeys(Key.ENTER).perform();
      
   element(by.name("password")).sendKeys(password);
   browser.actions().sendKeys(Key.ENTER).perform();
   ...
```

We select an element with the id of "identifierId" and type the username variable into that field (sendKeys does the typing). We then send the 'ENTER', which pushes the 'next' button to move onto the area where the password is entered. We use the same methods to enter the password, and then hit ENTER again to finally sign-in.

**DO NOT PUT YOUR USERNAME AND PASSWORD INTO THE CODE!** 

Again, this should come from a secret file. The 'username' and 'password' variables should have been successfully retrieved by the first function.

Finally, we switch back to our default window since we don't need the sign-in window anymore.

#### `ride-list.po.ts (logIn)`
```javascript
...
browser.driver.switchTo().window(handles[0]);
...
````
Again, if you're using ux_mode = redirect in the gapi.auth.init(), you should remove this code. 

At the point the tests *should*  be able to interact with parts of the application that are gated behind the sign-in. In our implementation, there are couple things that might need to be explained. Let's take a look at the corresponding file that does the actual testing (near the top of the file).

#### `ride-list.e2e-spec.ts`
```javascript
...
describe('Ride List', () => {
  let page: RidePage;

  beforeAll(() => {
    page = new RidePage();
    page.logIn();
    element(by.id("MoRide")).click();
    element(by.id("menuButton")).click();
    browser.driver.sleep(5000);
  });
  ...
```
The first 'describe' codeblock has a function called 'beforeAll'. This is similar to 'beforeEach', except that it only runs once for the
'describe' code block. This is so we don't try to log-in each time we run a test since this should already be done. For additional 
information, [Brezeal is a good source.](http://breazeal.com/blog/jasmineBefore.html)

We create a new RidePage() (the object that has all of our important testing functions), and then we do logIn(). Recall that this 
function also calls the get_username_and_password function, so that get's done as well. 

In our project, clicking on the 'MoRide' element was necessary before we could click on the 'menuButton' element to navigate around the
app. Your situation is likely different, so feel free to remove those two lines of code and replace it with something else.

The browser.driver.sleep() code is just used to slow down the tests while we are watching at certain points. This is sometimes necessary 
as the e2e tests may at times work faster than a page can load certain elements that the tests are expecting. It may not be necessary 
in your case, but you may find it handy.
