client cache manager
=====================

[![Coverage Status](https://coveralls.io/repos/github/kellyrmilligan/cache-client-promise/badge.svg?branch=master)](https://coveralls.io/github/kellyrmilligan/cache-client-promise?branch=master)


simple client-side cache module. helps especially when requests are being fired so fast that the same request can be fired before the same request finishes.

## Why?
A lot of tutorials and what not are solid and advise well on client side cacheing strategies. I needed a more generic cache that I could use with promises, and that could handle the scenario that if a request was fired off, and the same request was made before the first one finished, you could still get the result of the first request.

## Usage
```js

const myCache = new clientCache();

myCache.get('article-12345', function () {
  return fetch(`/api/articles/12345`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
  })
    .then(response => response.json())
})
  .then((article) => {
    //do something with the article
  })
  .catch((reason) => {
    //something happened most likely in your requesting function
  })
```

check out the tests in the repo for more examples!


This will check the cache for the key that you give to it, and if already there, will resolve immediately.

If it is not yet in the cache, it will add your cache key to it's list, where it keeps a list of internal promises of everything that requests this key.

When the first request for the key finally resolves, it will look at the promises that have been stored for itself internally and resolve them.
